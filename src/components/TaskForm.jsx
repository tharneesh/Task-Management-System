import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { TASK_TYPES, PRIORITIES, BUG_SEVERITIES } from '../api/mockApi';

// TODO: Implement TaskForm component
// Requirements:
// 1. Dynamic fields based on task type
// 2. Form validation with custom rules
// 3. Field arrays for subtasks and acceptance criteria
// 4. Integration with Redux for data and state
// 5. Auto-save functionality
// 6. File attachment simulation

const TaskForm = ({ 
  isOpen, 
  mode, // 'create' or 'edit'
  initialData = null,
  onSubmit,
  onClose,
  users = [],
  projects = [],
  loading = false 
}) => {
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isValid, isSubmitting }, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      taskType: 'Bug',
      priority: 'Medium',
      projectId: '',
      assigneeId: '',
      dueDate: '',
      severity: 'Medium',
      stepsToReproduce: '',
      businessValue: '',
      acceptanceCriteria: [],
      currentBehavior: '',
      proposedBehavior: '',
      researchQuestions: [],
      expectedOutcomes: '',
      subtasks: []
    },
    mode: 'onSubmit'
  });

  const { fields: subtaskFields, append: appendSubtask, remove: removeSubtask } = useFieldArray({
    control,
    name: 'subtasks'
  });

  const { fields: criteriaFields, append: appendCriteria, remove: removeCriteria } = useFieldArray({
    control,
    name: 'acceptanceCriteria'
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'researchQuestions'
  });

  const watchedTaskType = watch('taskType');
  const watchedProjectId = watch('projectId');

  // Filter users based on selected project
  const availableUsers = React.useMemo(() => {
    if (!watchedProjectId) return users;
    return users.filter(user => user.projectIds && user.projectIds.includes(watchedProjectId));
  }, [users, watchedProjectId]);

  // Auto-save functionality
  React.useEffect(() => {
    if (!isOpen) return;

    const subscription = watch((value) => {
      localStorage.setItem('taskFormData', JSON.stringify(value));
    });

    return () => subscription.unsubscribe();
  }, [watch, isOpen]);

  // Restore form data on mount
  React.useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem('taskFormData');
      if (savedData && !initialData) {
        try {
          const parsedData = JSON.parse(savedData);
          reset(parsedData);
        } catch (error) {
          console.error('Failed to restore form data:', error);
        }
      } else if (initialData) {
        reset(initialData);
      }
    }
  }, [isOpen, initialData, reset]);

  // Clear saved data on successful submit
  const clearSavedData = () => {
    localStorage.removeItem('taskFormData');
  };

  const renderDynamicFields = () => {
    switch (watchedTaskType) {
      case 'Bug':
        return (
          <>
            <div className="form-group">
              <label>Severity *</label>
              <select {...register('severity', { required: 'Severity is required' })}>
                {BUG_SEVERITIES.map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
              {errors.severity && <span className="form-error">{errors.severity.message}</span>}
            </div>

            <div className="form-group">
              <label>Steps to Reproduce</label>
              <textarea
                {...register('stepsToReproduce')}
                placeholder="1. Step one&#10;2. Step two&#10;3. Expected vs actual result"
                rows={4}
              />
            </div>
          </>
        );

      case 'Feature':
        return (
          <>
            <div className="form-group">
              <label>Business Value</label>
              <textarea
                {...register('businessValue')}
                placeholder="Describe the business value and impact of this feature"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Acceptance Criteria</label>
              {criteriaFields.map((field, index) => (
                <div key={field.id} className="field-array-item">
                  <input
                    {...register(`acceptanceCriteria.${index}`)}
                    placeholder={`Acceptance criteria ${index + 1}`}
                  />
                  <button type="button" onClick={() => removeCriteria(index)}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => appendCriteria('')}>Add Criteria</button>
            </div>
          </>
        );

      case 'Enhancement':
        return (
          <>
            <div className="form-group">
              <label>Current Behavior</label>
              <textarea
                {...register('currentBehavior')}
                placeholder="Describe the current behavior"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Proposed Behavior</label>
              <textarea
                {...register('proposedBehavior')}
                placeholder="Describe the proposed improvement"
                rows={3}
              />
            </div>
          </>
        );

      case 'Research':
        return (
          <>
            <div className="form-group">
              <label>Research Questions</label>
              {questionFields.map((field, index) => (
                <div key={field.id} className="field-array-item">
                  <input
                    {...register(`researchQuestions.${index}`)}
                    placeholder={`Research question ${index + 1}`}
                  />
                  <button type="button" onClick={() => removeQuestion(index)}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => appendQuestion('')}>Add Question</button>
            </div>

            <div className="form-group">
              <label>Expected Outcomes</label>
              <textarea
                {...register('expectedOutcomes')}
                placeholder="What outcomes do you expect from this research?"
                rows={3}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const handleFormSubmit = React.useCallback((data) => {
    console.log('Form submitting with data:', data);
    
    // Clear saved data on successful submit
    clearSavedData();
    
    // Direct submission
    onSubmit(data);
  }, [onSubmit]);

  if (!isOpen) return null;

  return (
    <div className="task-form-overlay">
      <div className="task-form">
        <div className="task-form-header">
          <h2>{mode === 'create' ? 'Create New Task' : 'Edit Task'}</h2>
          <button onClick={onClose}>×</button>
        </div>

        <form 
          key={`${mode}-${initialData?.id || 'new'}`}
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          {/* Basic Fields */}
          <div className="form-group">
            <label>Title *</label>
            <input
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' }
              })}
              placeholder="Enter task title"
            />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label>Task Type *</label>
            <select {...register('taskType', { required: 'Task type is required' })}>
              {TASK_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.taskType && <span className="form-error">{errors.taskType.message}</span>}
          </div>

          <div className="form-group">
            <label>Priority *</label>
            <select {...register('priority', { required: 'Priority is required' })}>
              {PRIORITIES.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
            {errors.priority && <span className="form-error">{errors.priority.message}</span>}
          </div>

          <div className="form-group">
            <label>Project</label>
            <select {...register('projectId')}>
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Assignee</label>
            <select {...register('assigneeId')}>
              <option value="">Select an assignee</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              {...register('description', {
                maxLength: { value: 500, message: 'Description must be less than 500 characters' }
              })}
              placeholder="Enter task description"
              rows={3}
            />
            {errors.description && <span className="form-error">{errors.description.message}</span>}
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              {...register('dueDate')}
            />
          </div>

          {/* Dynamic Fields */}
          {renderDynamicFields()}

          {/* Subtasks */}
          <div className="form-group">
            <label>Subtasks</label>
            {subtaskFields.map((field, index) => (
              <div key={field.id} className="field-array-item">
                <input
                  {...register(`subtasks.${index}.title`)}
                  placeholder={`Subtask ${index + 1}`}
                />
                <label>
                  <input
                    type="checkbox"
                    {...register(`subtasks.${index}.completed`)}
                  />
                  Completed
                </label>
                <button type="button" onClick={() => removeSubtask(index)}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => appendSubtask({ title: '', completed: false })}>
              Add Subtask
            </button>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !isValid || isSubmitting}>
              {loading || isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;