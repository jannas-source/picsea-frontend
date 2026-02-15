# Specification: UI/UX Refinement & Contact Workflow

## 1. Objective

Refine the 7Sense landing page to achieve a premium "Modern Marine Utility" aesthetic, improve logo blending, and implement a functional contact workflow.

## 2. Requirements

### 2.1 Logo Refinement

- Remove the "white frame" effect from the logo in the Navbar and Hero sections.
- Ensure the logo blends elegantly with the dark glassmorphic background.
- Potential approach: Use CSS masks, background-clip, or blend modes (e.g., `mix-blend-mode: screen`).

### 2.2 Contact Workflow

- Implement a dedicated `#contact` section on the landing page.
- design a premium, glassmorphic contact form.
- Include fields: Full Name, Email, Organization, Project Type (Dropdown), and Message.
- Implement client-side validation using Zod and React Hook Form (or simple state).
- Handle "Submission success" with a smooth Framer Motion animation (e.g., a "check" animation).
- Since it's a static site, initially implement a "Success" state transition, and mention integration with a backend/Formspree in the future.

### 2.3 UI/UX Enhancements

- Enhance the "Palantir" aesthetic with subtle micro-interactions.
- Improve spacing and typography hierarchy.
- Ensure the "Experience" feels alive (e.g., cursor hover effects on cards, subtle parallax).

## 3. Success Metrics

- Contact form transitions to success state on submission.
- Logo appears floating and integrated without a visible square container or white borders.
- Landing page sections are fully navigable via anchors.
