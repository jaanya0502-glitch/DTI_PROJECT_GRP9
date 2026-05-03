✦ Authentication

User registration (name, email, password) and sign-in
Session persistence via localStorage ("Remember me")
Auth-guarded pages — redirect to login if not signed in
Sign out

✦ Home Dashboard

Personalized greeting with user's first name
Initials-based avatar chip in the navbar
Quick-nav cards to Calendar, Plan, Trips, and Explore (placeholder)
Live stats: total trips planned, upcoming trips, and active trips

✦ Trip Planning (plan.html)

Trip name and date range (departure + return) input
Activity type selection via clickable chip tags (12 types: Beach, Hiking, City, Camping, Formal, Photography, Winter Sports, Fitness, Work/Remote, Water Sports, Cycling, Tropical)
Smart packing list auto-generated from selected activities + a fixed essentials list
Custom item entry (with keyboard Enter support)
Individual item removal with slide-out animation
Checkbox packing progress tracker with animated progress bar
Overlap detection — warns if new trip dates conflict with an existing one
Validation: past departure dates blocked on new trips, return must be after departure
Edit mode — loads existing trip data pre-filled for editing
Save journey (create or update)
PDF export — opens a print-ready packing checklist in a new tab

✦ My Journeys (trips.html)

List of all saved trips with departure/return dates and activity tags
Live countdown badges: days to departure, trip in progress, or completed
Edit and Delete buttons per trip
Delete confirmation with shake animation before removal
Trip count badge on the page heading
Empty state message when no trips exist

✦ Calendar (calendar.html)

Monthly calendar grid with previous/next month navigation and "Today" button
Color-coded days: green for departure, blue for in-transit, red for return
Trip name label shown directly on calendar days
Hover tooltip showing trip name, dates, and day type (departure/transit/return)
Clicking a trip day opens it in edit mode
Trip list below the calendar filtered to the current month, with upcoming/active/past status

✦ UI & Design

Dark/light mode toggle, persisted across sessions
Toast notification system for user feedback
Smooth page-transition and enter animations
Responsive layout for mobile screens
Consistent gold-accent design system with CSS custom properties
