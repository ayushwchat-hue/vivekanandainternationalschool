
# Add Scroll-Triggered Animations to Homepage

## Overview
Add smooth, performant scroll-triggered animations to all homepage sections using the Intersection Observer API. Elements will animate into view as users scroll down the page, creating an engaging and modern user experience.

## What You'll Get
- Elements fade/slide into view when they become visible on screen
- Staggered animations for grid items (cards appear one after another)
- Smooth, professional transitions that don't overwhelm
- Performance-optimized animations that only trigger once

## Implementation Approach

### 1. Create a Reusable Animation Hook
Build a custom React hook that uses the Intersection Observer API to detect when elements enter the viewport:
- Tracks visibility of elements
- Returns animation classes when element is in view
- Supports staggered delays for multiple items
- Only animates once (doesn't replay when scrolling back up)

### 2. Update Each Homepage Section

**About Section**
- Left image slides in from the left
- Right content slides in from the right
- Mission/Vision cards fade in with stagger effect

**Programs Section**
- Header fades up
- Program cards animate in sequence (one after another)
- CTA button fades in last

**Facilities Section**
- Header fades up
- Main facility cards scale in with stagger
- Additional facility items slide up in sequence

**Gallery Section**
- Header fades up
- Gallery images scale in with stagger effect

**Testimonials Section**
- Header fades up
- Testimonial cards slide up with stagger

**Contact Section**
- Left contact info slides in from left
- Right form slides in from right
- Contact detail items animate in sequence

---

## Technical Details

### Custom Hook: `useScrollAnimation`
```text
Location: src/hooks/useScrollAnimation.ts

Features:
- Uses IntersectionObserver API (native browser, no dependencies)
- Configurable threshold (default: 10% visible)
- Returns ref + isVisible boolean
- Only triggers once per element
```

### CSS Animation Classes (already exist)
The project already has these animations defined in `index.css`:
- `animate-fade-in` - opacity 0 to 1
- `animate-slide-up` - slide from bottom + fade
- `animate-slide-in-left` - slide from left + fade
- `animate-slide-in-right` - slide from right + fade
- `animate-scale-in` - scale from 95% + fade
- Animation delay utilities (100ms to 500ms)

### Animation Pattern for Each Element
```text
Initial state: opacity-0 + transform offset
Triggered state: Apply animation class when in view
Transition: 0.6s ease-out
```

### Files to Modify
1. `src/hooks/useScrollAnimation.ts` (new) - Custom intersection observer hook
2. `src/components/home/AboutSection.tsx` - Add scroll animations
3. `src/components/home/ProgramsSection.tsx` - Add scroll animations
4. `src/components/home/FacilitiesSection.tsx` - Add scroll animations
5. `src/components/home/GallerySection.tsx` - Add scroll animations
6. `src/components/home/TestimonialsSection.tsx` - Add scroll animations
7. `src/components/home/ContactSection.tsx` - Add scroll animations
8. `src/index.css` - Add initial opacity-0 state classes
