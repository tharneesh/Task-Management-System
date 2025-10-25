# Task Management Dashboard - Interview Project

A sophisticated React application built with Redux and Redux Saga for interviewing senior developers (5+ years experience).

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Read the requirements:**
   - Check `INTERVIEW_REQUIREMENTS.md` for detailed task description
   - Review `EVALUATION_RUBRIC.md` for scoring criteria

## Project Structure

```
src/
├── api/
│   └── mockApi.js           # Mock API with realistic delays
├── store/
│   ├── index.js             # Redux store configuration (TODO)
│   ├── actions/             # Action creators (TODO)
│   ├── reducers/            # Redux reducers (TODO)
│   ├── sagas/               # Redux sagas (TODO)
│   └── selectors/           # Reselect selectors (TODO)
├── components/
│   ├── TaskDashboard.jsx    # Main container (TODO)
│   ├── TaskForm.jsx         # Dynamic form with React Hook Form (TODO)
│   ├── TaskList.jsx         # Task list display (TODO)
│   ├── TaskCard.jsx         # Individual task card (TODO)
│   └── FilterBar.jsx        # Advanced filtering (TODO)
└── App.jsx                  # Root component with Redux Provider
```

## Interview Challenge

**Time Limit:** 30 minutes  
**Target:** Senior React Developer (5+ years)

### What You Need to Build

A task management dashboard featuring:

1. **Complex Redux Architecture**
   - Normalized state structure
   - Optimistic updates
   - Advanced saga patterns

2. **Dynamic Forms with React Hook Form**
   - Conditional fields based on task type
   - Field arrays for subtasks
   - Complex validation rules

3. **Advanced UX Features**
   - Real-time filtering and search
   - Loading states and error handling
   - Auto-save functionality

### Technical Requirements

- **Redux:** Traditional Redux (not RTK) with normalized state
- **Redux Saga:** Handle async operations, optimistic updates
- **React Hook Form:** Dynamic forms with validation
- **Performance:** Proper memoization and re-render optimization

### Mock API Available

The `mockApi` provides realistic endpoints with:
- Simulated network delays (300-1500ms)
- 10% random failure rate for testing error handling
- Complete CRUD operations for tasks
- User and project management

### Getting Started Tips

1. Start with Redux store setup in `src/store/index.js`
2. Implement basic task actions and reducers
3. Create simple sagas for API calls
4. Build the task form with dynamic fields
5. Add optimistic updates and error handling

### Success Criteria

- **Functional:** Basic CRUD operations work
- **Advanced:** Optimistic updates, complex forms, error handling
- **Senior-level:** Clean architecture, performance considerations, edge cases

## Evaluation

Candidates are evaluated on:
- Redux architecture and patterns (30 points)
- Saga implementation and async handling (25 points)
- Form engineering with React Hook Form (20 points)
- System design and code quality (15 points)
- User experience and polish (10 points)

See `EVALUATION_RUBRIC.md` for detailed scoring criteria.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

Good luck! 🚀
