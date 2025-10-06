const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Check if AWS credentials are properly configured
const hasValidAWSCredentials = () => {
  return (
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID !== "your_aws_access_key_id" &&
    process.env.AWS_SECRET_ACCESS_KEY !== "your_aws_secret_access_key" &&
    process.env.AWS_S3_BUCKET !== "your-s3-bucket-name"
  );
};

// Initialize S3 client
let s3Client = null;
if (hasValidAWSCredentials()) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

class CourseService {
  /**
   * Get all courses with optional filtering
   */
  async getAllCourses(filters = {}) {
    try {
      const {
        search,
        category,
        level,
        teacher,
        minPrice,
        maxPrice,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 10,
      } = filters;

      // Build query
      let query = { isPublished: true };

      if (search) {
        query.$text = { $search: search };
      }

      if (category) {
        query.category = category;
      }

      if (level) {
        query.level = level;
      }

      if (teacher) {
        query.teacher = teacher;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = minPrice;
        if (maxPrice !== undefined) query.price.$lte = maxPrice;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query with population
      const courses = await Course.find(query)
        .populate("teacher", "name email")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Get total count for pagination
      const total = await Course.countDocuments(query);

      return {
        success: true,
        courses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw new Error("Failed to fetch courses");
    }
  }

  /**
   * Get course by ID with enrollment status
   */
  async getCourseById(courseId, userId = null) {
    try {
      const course = await Course.findById(courseId)
        .populate("teacher", "name email")
        .lean();

      if (!course) {
        throw new Error("Course not found");
      }

      // Check enrollment status if user is provided
      let isEnrolled = false;
      if (userId) {
        const enrollment = await Enrollment.findOne({
          user: userId,
          course: courseId,
        });
        isEnrolled = !!enrollment;
      }

      return {
        success: true,
        course: {
          ...course,
          isEnrolled,
        },
      };
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  }

  /**
   * Get course content (videos) with signed URLs
   */
  async getCourseContent(courseId, userId) {
    try {
      // Check if user is enrolled
      const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
      });

      if (!enrollment) {
        throw new Error("You must be enrolled to access course content");
      }

      const course = await Course.findById(courseId).lean();
      if (!course) {
        throw new Error("Course not found");
      }

      // Generate signed URLs for videos
      const videos = [];
      if (course.videoLinks && course.videoLinks.length > 0) {
        for (let i = 0; i < course.videoLinks.length; i++) {
          const videoKey = course.videoLinks[i];
          let signedUrl = videoKey;

          // If S3 is configured, generate signed URL
          if (s3Client && hasValidAWSCredentials()) {
            try {
              signedUrl = await getSignedUrl(
                s3Client,
                new GetObjectCommand({
                  Bucket: process.env.AWS_S3_BUCKET,
                  Key: videoKey,
                }),
                { expiresIn: 7200 } // 2 hours
              );
            } catch (urlError) {
              console.warn(
                `Failed to generate signed URL for ${videoKey}:`,
                urlError
              );
              // Fallback to original key
              signedUrl = videoKey;
            }
          }

          videos.push({
            title: `Lesson ${i + 1}`,
            url: signedUrl,
            duration: null, // Could be enhanced to store actual duration
            index: i,
          });
        }
      }

      return {
        success: true,
        videos,
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
        },
      };
    } catch (error) {
      console.error("Error fetching course content:", error);
      throw error;
    }
  }

  /**
   * Enroll user in course
   */
  async enrollUser(courseId, userId) {
    try {
      // Check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
      });

      if (existingEnrollment) {
        throw new Error("Already enrolled in this course");
      }

      // Create enrollment
      const enrollment = new Enrollment({
        user: userId,
        course: courseId,
        enrolledAt: new Date(),
      });

      await enrollment.save();

      // Update course enrollment count
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrollmentCount: 1 },
      });

      return {
        success: true,
        message: "Successfully enrolled in course",
        enrollment,
      };
    } catch (error) {
      console.error("Error enrolling user:", error);
      throw error;
    }
  }

  /**
   * Get user's enrolled courses
   */
  async getUserEnrolledCourses(userId) {
    try {
      const enrollments = await Enrollment.find({ user: userId })
        .populate({
          path: "course",
          populate: {
            path: "teacher",
            select: "name email",
          },
        })
        .sort({ enrolledAt: -1 })
        .lean();

      const courses = enrollments.map((enrollment) => ({
        ...enrollment.course,
        enrolledAt: enrollment.enrolledAt,
        isEnrolled: true,
      }));

      return {
        success: true,
        courses,
      };
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      throw error;
    }
  }

  /**
   * Create new course (teacher/admin only)
   */
  async createCourse(courseData, teacherId) {
    try {
      const course = new Course({
        ...courseData,
        teacher: teacherId,
      });

      await course.save();

      const populatedCourse = await Course.findById(course._id)
        .populate("teacher", "name email")
        .lean();

      return {
        success: true,
        course: populatedCourse,
        message: "Course created successfully",
      };
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  }

  /**
   * Update course (teacher/admin only)
   */
  async updateCourse(courseId, updateData, userId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Check if user is the teacher or admin
      if (course.teacher.toString() !== userId) {
        throw new Error("Unauthorized: You can only update your own courses");
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate("teacher", "name email")
        .lean();

      return {
        success: true,
        course: updatedCourse,
        message: "Course updated successfully",
      };
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  }

  /**
   * Delete course (teacher/admin only)
   */
  async deleteCourse(courseId, userId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Check if user is the teacher or admin
      if (course.teacher.toString() !== userId) {
        throw new Error("Unauthorized: You can only delete your own courses");
      }

      // Delete related enrollments
      await Enrollment.deleteMany({ course: courseId });

      // Delete the course
      await Course.findByIdAndDelete(courseId);

      return {
        success: true,
        message: "Course deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  }

  /**
   * Get courses by teacher
   */
  async getCoursesByTeacher(teacherId) {
    try {
      const courses = await Course.find({ teacher: teacherId })
        .populate("teacher", "name email")
        .sort({ createdAt: -1 })
        .lean();

      return {
        success: true,
        courses,
      };
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
      throw error;
    }
  }

  /**
   * Generate presigned URL for video upload
   */
  async generateUploadUrl(fileName, contentType) {
    try {
      if (!s3Client || !hasValidAWSCredentials()) {
        throw new Error("AWS S3 not configured");
      }

      const key = `courses/videos/${Date.now()}-${fileName}`;

      const uploadUrl = await getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
          ContentType: contentType,
        }),
        { expiresIn: 3600 } // 1 hour
      );

      return {
        success: true,
        uploadUrl,
        key,
      };
    } catch (error) {
      console.error("Error generating upload URL:", error);
      throw error;
    }
  }
}

module.exports = new CourseService();
