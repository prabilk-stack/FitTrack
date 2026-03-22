# FitTrack

A React Native fitness app built with Expo. Designed as a single destination for tracking workouts, nutrition, body weight, and health goals.

## What's built so far

### Screens
- **Dashboard (Home)** — central hub showing today's calories, macro progress, workout summary, and body weight trend
- **Workout** — log exercises with sets, reps, and weight. Resets daily
- **Nutrition** — log meals with calories, protein, carbs, and fat. Progress bars vs daily targets. Resets daily
- **Goals** — TDEE and BMR calculator using Mifflin-St Jeor formula. Supports goal weight, rate of loss/gain, and activity level
- **Weight** — daily body weight log with timestamp history and trend chart

### Features
- Persistent local storage using AsyncStorage
- Daily auto-reset for workout and nutrition logs
- Macro progress bars modeled after Cronometer
- Custom tab bar with icons (dumbbell, chicken leg, home, trophy, scale)
- GitHub backup

## Tech stack
- React Native + Expo
- expo-router for navigation
- AsyncStorage for local storage
- react-native-svg for icons

## Roadmap
### Phase 2 (next)
- Barcode scanner for food logging
- GPS activity tracking
- Supabase cloud storage
- Apple Health / wearable sync

### Phase 3
- AI-powered health insights
- Social feed and activity sharing
- Multi-week training programs
- Unified analytics dashboard

### Phase 4
- Coaching marketplace
- AI meal planning
- Community challenges
- Open API

## Running the app
1. Install dependencies: `npm install`
2. Start the server: `npx expo start`
3. Scan the QR code with Expo Go on your phone

## Dev notes
- All screens live in `app/(tabs)/`
- Data is stored locally with AsyncStorage keys: `workoutLog`, `nutritionLog`, `bodyweightLog`, `macroGoals`
- Daily reset logic checks `workoutLogDate` and `nutritionLogDate` keys