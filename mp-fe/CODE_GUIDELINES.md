# Frontend Code Guidelines

## Table of Contents

1. [General Principles](#general-principles)
2. [Project Structure](#project-structure)
3. [React Best Practices](#react-best-practices)
4. [Component Guidelines](#component-guidelines)
5. [State Management](#state-management)
6. [Styling Guidelines](#styling-guidelines)
7. [Performance Guidelines](#performance-guidelines)
8. [Testing Guidelines](#testing-guidelines)
9. [Code Quality](#code-quality)
10. [File Naming Conventions](#file-naming-conventions)

## General Principles

### 1. Code Organization

- Follow the **Single Responsibility Principle** - each component should have one clear purpose
- Keep components small and focused
- Use meaningful names for variables, functions, and components
- Write self-documenting code with clear intent

### 2. Consistency

- Use consistent formatting and indentation
- Follow established patterns in the codebase
- Use the same naming conventions throughout the project

### 3. Maintainability

- Write code that is easy to understand and modify
- Avoid magic numbers and hardcoded values
- Use constants for configuration values
- Document complex logic with comments

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ComponentName/
│   │   ├── index.jsx    # Main component file
│   │   └── styles.js    # Component-specific styles (if needed)
├── pages/              # Page-level components
├── store/              # Redux store configuration
│   ├── actions/        # Redux actions
│   ├── reducers/       # Redux reducers
│   └── store.jsx       # Store configuration
├── assets/             # Static assets (images, videos, etc.)
├── styles/             # Global styles
├── utils/              # Utility functions
└── theme.js            # Material-UI theme configuration
```

## React Best Practices

### 1. Functional Components with Hooks

```jsx
// ✅ Good
import React, { useState, useEffect } from "react";

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Spinner />;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};

// ❌ Avoid class components unless absolutely necessary
```

### 2. Props and PropTypes

```jsx
import PropTypes from "prop-types";

const CourseCard = ({ course, onEnroll, isEnrolled }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{course.title}</Typography>
        <Typography variant="body2">{course.description}</Typography>
        <Button onClick={() => onEnroll(course.id)} disabled={isEnrolled}>
          {isEnrolled ? "Enrolled" : "Enroll"}
        </Button>
      </CardContent>
    </Card>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onEnroll: PropTypes.func.isRequired,
  isEnrolled: PropTypes.bool,
};

CourseCard.defaultProps = {
  isEnrolled: false,
};
```

### 3. Custom Hooks

```jsx
// ✅ Good - Extract reusable logic into custom hooks
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateToken(token)
        .then((userData) => setUser(userData))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    setUser(response.user);
    localStorage.setItem("token", response.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return { user, loading, login, logout };
};
```

## Component Guidelines

### 1. Component Structure

```jsx
// Standard component structure
import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Button } from "@mui/material";

const ComponentName = ({ prop1, prop2, onAction }) => {
  // 1. Hooks
  const [state, setState] = useState(initialValue);

  // 2. Event handlers
  const handleClick = () => {
    // Handle click logic
  };

  // 3. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 4. Render
  return (
    <Box>
      <Typography>{prop1}</Typography>
      <Button onClick={handleClick}>{prop2}</Button>
    </Box>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.string,
  onAction: PropTypes.func,
};

ComponentName.defaultProps = {
  prop2: "Default value",
};

export default ComponentName;
```

### 2. Component Composition

```jsx
// ✅ Good - Use composition over inheritance
const CourseList = ({ courses }) => {
  return (
    <Grid container spacing={2}>
      {courses.map((course) => (
        <Grid item xs={12} sm={6} md={4} key={course.id}>
          <CourseCard course={course} />
        </Grid>
      ))}
    </Grid>
  );
};

// ✅ Good - Use render props or children for flexibility
const Modal = ({ isOpen, onClose, children, title }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};
```

## State Management

### 1. Redux Toolkit Best Practices

```jsx
// store/actions/authActions.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
```

### 2. Local State vs Redux State

```jsx
// ✅ Use local state for component-specific data
const CourseForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });

  // ✅ Use Redux for global state
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = () => {
    dispatch(createCourse(formData));
  };
};
```

## Styling Guidelines

### 1. Material-UI Best Practices

```jsx
// ✅ Use theme for consistent styling
import { useTheme } from "@mui/material/styles";

const StyledComponent = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1],
      }}
    >
      Content
    </Box>
  );
};

// ✅ Use styled components for complex styling
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: "none",
  fontWeight: 600,
  "&:hover": {
    transform: "translateY(-2px)",
    transition: "transform 0.2s ease-in-out",
  },
}));
```

### 2. Responsive Design

```jsx
// ✅ Use Material-UI's responsive breakpoints
const ResponsiveComponent = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
              }}
            >
              Responsive Title
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
```

## Performance Guidelines

### 1. React.memo and useMemo

```jsx
// ✅ Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  return (
    <div>
      {data.map((item) => (
        <ListItem key={item.id} item={item} onAction={onAction} />
      ))}
    </div>
  );
});

// ✅ Use useMemo for expensive calculations
const CourseList = ({ courses, filter }) => {
  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [courses, filter]);

  return (
    <div>
      {filteredCourses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};
```

### 2. Lazy Loading

```jsx
// ✅ Use lazy loading for route components
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:id" element={<CourseDetail />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
```

## Testing Guidelines

### 1. Component Testing

```jsx
// Component test example
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../store/store";
import CourseCard from "./CourseCard";

const renderWithProvider = (component) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe("CourseCard", () => {
  const mockCourse = {
    id: "1",
    title: "Test Course",
    description: "Test Description",
  };

  it("renders course information correctly", () => {
    renderWithProvider(<CourseCard course={mockCourse} />);

    expect(screen.getByText("Test Course")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("calls onEnroll when enroll button is clicked", () => {
    const mockOnEnroll = jest.fn();
    renderWithProvider(
      <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
    );

    fireEvent.click(screen.getByText("Enroll"));
    expect(mockOnEnroll).toHaveBeenCalledWith("1");
  });
});
```

### 2. Custom Hook Testing

```jsx
// Custom hook test example
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "./useAuth";

describe("useAuth", () => {
  it("should return initial state", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(true);
  });
});
```

## Code Quality

### 1. ESLint Configuration

```javascript
// eslint.config.mjs
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      // Custom rules
      "react/prop-types": "error",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "warn",
      "prefer-const": "error",
    },
  },
];
```

### 2. Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## File Naming Conventions

### 1. Components

- Use **PascalCase** for component files: `CourseCard.jsx`
- Use **PascalCase** for component folders: `CourseCard/`
- Use `index.jsx` as the main component file in folders

### 2. Utilities and Hooks

- Use **camelCase** for utility files: `formatDate.js`
- Use **camelCase** with `use` prefix for hooks: `useAuth.js`

### 3. Constants

- Use **UPPER_SNAKE_CASE** for constants: `API_ENDPOINTS.js`

### 4. Assets

- Use **kebab-case** for asset files: `hero-image.jpg`
- Use descriptive names that indicate the content

## Git Commit Guidelines

### 1. Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

### 2. Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 3. Examples

```
feat(auth): add login functionality with JWT
fix(courses): resolve course card rendering issue
docs(readme): update installation instructions
style(components): format code with prettier
```

## Security Guidelines

### 1. Input Validation

```jsx
// ✅ Always validate user input
import * as Yup from "yup";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const LoginForm = () => {
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: (values) => {
      // Handle form submission
    },
  });
};
```

### 2. XSS Prevention

```jsx
// ✅ Use React's built-in XSS protection
// React automatically escapes content, but be careful with dangerouslySetInnerHTML

// ❌ Avoid this unless absolutely necessary
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Use this instead
<div>{userContent}</div>
```

## Accessibility Guidelines

### 1. Semantic HTML

```jsx
// ✅ Use semantic HTML elements
const CourseSection = () => {
  return (
    <section aria-labelledby="courses-heading">
      <h2 id="courses-heading">Available Courses</h2>
      <ul role="list">
        {courses.map((course) => (
          <li key={course.id} role="listitem">
            <CourseCard course={course} />
          </li>
        ))}
      </ul>
    </section>
  );
};
```

### 2. ARIA Labels

```jsx
// ✅ Provide proper ARIA labels
const SearchBar = () => {
  return (
    <TextField
      label="Search courses"
      aria-label="Search for music courses"
      placeholder="Enter course name..."
    />
  );
};
```

## Performance Monitoring

### 1. Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx serve -s build
npx webpack-bundle-analyzer build/static/js/*.js
```

### 2. Performance Metrics

- Monitor Core Web Vitals
- Use React DevTools Profiler
- Implement error boundaries for better error handling

## Conclusion

Following these guidelines will help maintain code quality, improve performance, and ensure a consistent development experience across the team. Remember to:

1. **Review code regularly** and provide constructive feedback
2. **Keep learning** and stay updated with React best practices
3. **Document complex logic** and architectural decisions
4. **Write tests** for critical functionality
5. **Optimize for performance** from the start

These guidelines should be treated as living documents that evolve with the project and team needs.
