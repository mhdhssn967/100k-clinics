#!/bin/bash

echo "🚀 Creating project structure..."

# Root
mkdir -p 100k-clinics
cd 100k-clinics || exit

# Config files
touch README.md
touch package.json
touch vite.config.js
touch tailwind.config.js

# PUBLIC
mkdir -p public/assets/icons

# SRC BASE
mkdir -p src/{assets,config,context,hooks,services,lib,store,utils,types,layouts,components,features,pages}

# CONFIG
touch src/config/{branding.js,constants.js}

# ROUTES
mkdir -p src/routes
touch src/routes/{index.jsx,publicRoutes.jsx,authRoutes.jsx,dashboardRoutes.jsx,adminRoutes.jsx,roleRoutes.jsx}

# CONTEXT
touch src/context/{AuthContext.jsx,ClinicContext.jsx,LanguageContext.jsx}

# HOOKS
touch src/hooks/{useAuth.js,useClinic.js,useAppointments.js,useRealtime.js,useAnalytics.js,useTheme.js}

# SERVICES
touch src/services/{apiService.js,appointmentService.js,medicalService.js,notificationService.js,analyticsService.js}

# LIB
touch src/lib/{validators.js,helpers.js,qrCode.js}

# UTILS
touch src/utils/{formatDate.js,validation.js,toast.js}

# STORE
mkdir -p src/store/slices
touch src/store/{index.js}
touch src/store/slices/{userSlice.js,clinicSlice.js,appointmentSlice.js}

# TYPES
touch src/types/{index.d.ts,appointment.d.ts,patient.d.ts}

# LAYOUTS
touch src/layouts/{PublicLayout.jsx,AuthLayout.jsx,DashboardLayout.jsx,AdminLayout.jsx,ClinicPanelLayout.jsx}

# COMPONENTS
mkdir -p src/components/{ui,layout,forms,medical,common}

touch src/components/ui/{Button.jsx,Card.jsx,Modal.jsx}
touch src/components/layout/{Navbar.jsx,Sidebar.jsx,Footer.jsx}
touch src/components/forms/{Input.jsx,Select.jsx}
touch src/components/medical/{PatientCard.jsx,VisitTimeline.jsx}
touch src/components/common/{Loader.jsx,EmptyState.jsx}

# FEATURES
mkdir -p src/features/{auth,clinic,appointments,patients,analytics,queue,notifications,telemedicine}

touch src/features/auth/{Login.jsx,Register.jsx}
touch src/features/clinic/{ClinicDashboard.jsx}
touch src/features/appointments/{AppointmentList.jsx,Booking.jsx}
touch src/features/patients/{PatientList.jsx}
touch src/features/analytics/{DashboardAnalytics.jsx}
touch src/features/queue/{QueueManager.jsx}
touch src/features/notifications/{NotificationPanel.jsx}
touch src/features/telemedicine/{VideoConsult.jsx}

# PAGES
mkdir -p src/pages/{public,auth,clinic-admin,doctor,patient,errors}

touch src/pages/public/{Home.jsx,Pricing.jsx,Services.jsx}
touch src/pages/auth/{Login.jsx,Register.jsx,ForgotPassword.jsx}
touch src/pages/clinic-admin/{Dashboard.jsx,Appointments.jsx}
touch src/pages/doctor/{Dashboard.jsx}
touch src/pages/patient/{Dashboard.jsx}
touch src/pages/errors/{404.jsx,401.jsx}

# STYLES
mkdir -p src/styles
touch src/styles/{variables.css,globals.css,animations.css}

# MAIN FILES
touch src/{main.jsx,App.jsx}

echo "✅ Project structure created successfully!"