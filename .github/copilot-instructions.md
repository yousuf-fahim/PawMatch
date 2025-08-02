# PawMatch: AI Agent Development Guide

## Project Overview
PawMatch is an Expo React Native pet adoption app using TypeScript. The app facilitates pet discovery through swipeable cards, comprehensive learning resources, and location-based services for connecting potential adopters with pets and pet shops.

## 🎯 CURRENT DEVELOPMENT PLAN

### Phase 1: UI Optimization (Week 1-2)
**Priority Tasks:**
- Move Pet Shops into Learning Center as a service category
- Remove "Popular This Week" section from Learn tab
- Optimize card swiping photos for better aspect ratios
- Create enhanced demo data with well-fitting images

### Phase 2: Page Development (Week 3-4)
**New Pages Needed:**
- Pet Detail Page (for both card pets and saved pets)
- Individual Learning Article Pages
- User Profile Edit Page
- Add Pet Page for user's own pets
- AI Chat Interface for Pet Counselor

### Phase 3: Backend Integration (Week 5-6)
**Database & API Setup:**
- Supabase database implementation
- User authentication and profiles
- Pet and article content management
- Admin panel for content updates

### Phase 4: AI Integration (Week 7-8)
**Qwen AI Implementation:**
- AI Pet Counselor chat interface
- Veterinary-focused conversation context
- Professional but casual tone implementation

## Architecture & Key Patterns

### Navigation Structure
- **Root Layout**: `app/_layout.tsx` - Font loading, gesture handling, splash screen control
- **Tab Navigation**: `app/(tabs)/` - 5-tab structure (Discover, Saved, Pet Shops, Learn, Profile)
- **Authentication**: `app/auth.tsx` - Formik + Yup validation, gradient-based UI
- **Entry Point**: `app/index.tsx` - Branded splash screen with guest/auth options

### Component Design System
- **Animations**: React Native Reanimated v3 for all interactions
  - `PetCard.tsx`: Complex swipe gestures with spring physics and rotation interpolation
  - `AnimatedLoader.tsx`: Multiple variants (bars, dots, paws, text) with staggered timing
  - `AnimatedButton.tsx`: Hover.dev-style interactive feedback
- **Typography Hierarchy**: Poppins (headings), Nunito (body text) - loaded via `expo-font`
- **Color Scheme**: Primary `#FF6B6B` (coral red), gradients for depth, white cards with shadows

### Data Management
- **Mock Data**: Located in `data/` - structured TypeScript interfaces
  - `pets.ts`: Pet objects with personality arrays, gender/size enums
  - `learningContent.ts`: Categorized articles with metadata (difficulty, readTime, tags)
- **No Database**: Currently using static mock data (Supabase configured but not implemented)

### State Patterns
- **Local State**: useState hooks for UI state (loading, filters, selections)
- **No Global State**: Each screen manages its own data fetching/filtering
- **Swipe Logic**: `PetCard` handles gesture state with `useSharedValue` and callbacks

## Development Workflows

### Running the Project
```bash
npm run dev          # Start Expo development server
npm run build:web    # Export for web platform
npm run lint         # Run Expo linting
```

### Key Dependencies
- **Core**: Expo SDK 53, React 19, React Native 0.79
- **Navigation**: Expo Router v5 with typed routes
- **UI**: Expo Linear Gradient, Blur, Haptics, Symbols
- **Animation**: React Native Reanimated, Gesture Handler
- **Forms**: Formik + Yup validation
- **Content**: React Native Markdown Display for articles

## Critical Implementation Details

### Font Loading Pattern
```tsx
// Always check font loading state before rendering
const [fontsLoaded, fontError] = useFonts({...});
if (!fontsLoaded && !fontError) return null;
```

### Animation Performance
- Use `useSharedValue` for animation state, `runOnJS` for callbacks
- Interpolate transforms and opacity for smooth card interactions
- Stagger animations with `withDelay` for group effects

### Screen Structure Template
```tsx
// Standard screen pattern used throughout
<SafeAreaView style={styles.container}>
  <View style={styles.header}>
    <Text style={styles.title}>Screen Title</Text>
    <Text style={styles.subtitle}>Description</Text>
  </View>
  {/* Content */}
</SafeAreaView>
```

### Styling Conventions
- Dimensions: `const { width, height } = Dimensions.get('window')` for responsive sizing
- Shadows: Consistent elevation with `shadowColor`, `shadowOffset`, `shadowOpacity`, `elevation`
- Cards: Always use `borderRadius: 12-20`, white background, subtle shadows
- Buttons: Primary coral (`#FF6B6B`), secondary white with coral text

## Integration Points

### Icons & Assets
- **Icons**: Lucide React Native - consistent style across app
- **Images**: External URLs for pet photos, local assets in `assets/images/`
- **Gradients**: Linear gradients for headers, cards, overlays

### Cross-Component Communication
- **PetCard → Parent**: Swipe callbacks (`onSwipeLeft`, `onSwipeRight`, `onPress`)
- **Navigation**: `useRouter()` for programmatic navigation
- **Data Flow**: Props down, events up - no complex state management

### Platform Considerations
- **Web Support**: Metro bundler configured for web output
- **Typography**: Custom font family names used in StyleSheet
- **Gestures**: Wrapped in `GestureHandlerRootView` at root level

## Common Patterns to Follow

### Error Handling
- Form validation with Yup schemas
- Font loading error states
- Graceful degradation for missing data

### Performance Optimizations
- Animated values for smooth 60fps interactions
- Image caching through React Native defaults
- Efficient FlatList rendering for pet lists

### Code Organization
- Separate `data/` for mock content
- Reusable components in `components/`
- Screen-specific logic in respective tab files
- Custom hooks in `hooks/` for framework integration

When working on this codebase, prioritize animation smoothness, maintain the established design system, and follow the existing patterns for navigation and state management.
