import React from 'react'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import Verify from './pages/Verify'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP'
import ChangePassword from './pages/ChangePassword'
import AuthSuccess from './pages/AuthSuccess'
import StudentDashboard from './pages/StudentDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import MenuPage from './pages/MenuPage'

const router = createBrowserRouter([
  { path: '/',                element: <><Navbar /><Home /></> },
  { path: '/signup',          element: <Signup /> },
  { path: '/register',        element: <Signup /> },
  { path: '/login',           element: <Login /> },
  { path: '/verify',          element: <VerifyEmail /> },
  { path: '/verify/:token',   element: <Verify /> },
  { path: '/auth-success',    element: <AuthSuccess /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/verify-otp/:email',     element: <VerifyOTP /> },
  { path: '/change-password/:email', element: <ChangePassword /> },
  { path: '/menu',            element: <MenuPage /> },
  {
    path: '/student',
    element: (
      <ProtectedRoute role={['student', 'mess_committee']}>
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/manager',
    element: (
      <ProtectedRoute role="mess_manager">
        <ManagerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
])

const App = () => <RouterProvider router={router} />

export default App
