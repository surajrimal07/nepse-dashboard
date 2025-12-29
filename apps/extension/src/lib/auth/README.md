# Authentication Optimization

## Overview
Comprehensive refactor of the authentication system to improve performance, reduce redundancy, and centralize auth state management.

## Key Improvements

### 1. **Centralized Auth Context** (`lib/auth/auth-context.tsx`)
- **Single Source of Truth**: One Convex query subscription for the entire app
- **Performance**: Eliminates duplicate auth queries across components
- **Reactive**: Auto-updates all consumers when auth state changes
- **Efficient**: Uses query skip pattern when user data is unavailable

**Before**: Each component created its own auth query
```typescript
// Multiple subscriptions across the app
const auth1 = useQuery(api.users.isUserAuthorized, {...}); // Header
const auth2 = useQuery(api.users.isUserAuthorized, {...}); // Route
const auth3 = useQuery(api.users.isUserAuthorized, {...}); // Component
```

**After**: Single subscription shared via context
```typescript
// One subscription for entire app
<AuthProvider>
  {/* All children share the same auth state */}
</AuthProvider>
```

### 2. **AuthGuard Component** (`lib/auth/auth-guard.tsx`)
- **Declarative Protection**: Wrap any component to require authentication
- **Smart Redirects**: Automatically redirects unauthenticated users
- **Loading States**: Built-in loading UI during auth checks
- **Flexible**: Supports custom fallbacks and redirect paths

**Usage**:
```typescript
<AuthGuard>
  <ProtectedComponent />
</AuthGuard>
```

### 3. **Removed Hardcoded Values**
**Before**:
```typescript
// Hardcoded test values
const isAuthenticated = await convex.query(api.users.isUserAuthorized, {
  randomId: "wdwe32",
  email: "sdsdsdsds",
});
```

**After**:
```typescript
// Dynamic user data from app state
const { isAuthenticated, user } = useAuth();
```

### 4. **Optimized Route Guards**
**Before**: Auth checked in multiple places
- Root route component
- Index route beforeLoad
- Header component
- Individual page components

**After**: Auth checked once in context, consumed everywhere
- AuthProvider at root
- AuthGuard for protected routes
- useAuth hook for auth-dependent logic

### 5. **Better Performance**
- **Reduced Network Requests**: 1 query instead of N queries
- **Reduced Re-renders**: Context only updates when auth state changes
- **Lazy Loading**: Auth check only runs when user data exists
- **Memoization**: Auth context value is memoized to prevent unnecessary re-renders

### 6. **Developer Experience**
- **Type Safety**: Full TypeScript support with proper types
- **Debugging**: Centralized auth logic easier to debug
- **Testing**: Single point to mock auth state
- **Maintainability**: Changes in one place affect entire app

## Usage Examples

### Basic Auth Check
```typescript
function MyComponent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Login />;

  return <div>Welcome {user?.email}</div>;
}
```

### Protected Route
```typescript
export const protectedRoute = createRoute({
  component: () => (
    <AuthGuard>
      <ProtectedPage />
    </AuthGuard>
  ),
});
```

### Conditional Rendering
```typescript
function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <nav>
      {isAuthenticated ? <UserMenu /> : <LoginButton />}
    </nav>
  );
}
```

## Migration Guide

### For Component Authors
Replace old pattern:
```typescript
import { isAuthorized } from "@/hooks/convex/auth";

function MyComponent() {
  const user = isAuthorized(); // Old way
  // ...
}
```

With new pattern:
```typescript
import { useAuth } from "@/lib/auth";

function MyComponent() {
  const { isAuthenticated, user } = useAuth(); // New way
  // ...
}
```

### For Route Definitions
Remove manual auth checks from beforeLoad:
```typescript
// ❌ Before
beforeLoad: async () => {
  const isAuthenticated = await convex.query(...);
  if (!isAuthenticated) throw redirect(...);
}

// ✅ After
component: () => (
  <AuthGuard>
    <YourComponent />
  </AuthGuard>
)
```

## Performance Metrics

### Before Optimization
- **Auth Queries**: 3-5 concurrent subscriptions
- **Re-renders**: Multiple components re-render on auth change
- **Network**: Duplicate queries with same parameters

### After Optimization
- **Auth Queries**: 1 shared subscription
- **Re-renders**: Only consuming components re-render
- **Network**: Single query, results shared via context

## Future Enhancements
- [ ] Add auth state persistence
- [ ] Implement auth refresh/retry logic
- [ ] Add role-based access control (RBAC)
- [ ] Support for multiple auth strategies
- [ ] Auth event hooks (onLogin, onLogout, etc.)
