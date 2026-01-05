interface ProjectDescriptionFormProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProjectDescriptionForm = ({
  value,
  onChange,
}: ProjectDescriptionFormProps) => {
  return (
    <div className="form-group">
      <label htmlFor="projectDescription">Project Description</label>
      <textarea
        id="projectDescription"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe your project here... For example: Build a todo app with user authentication and task management"
        rows={6}
        required
      />
    </div>
  );
};

