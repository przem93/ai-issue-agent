interface HeaderProps {
  showClearButton: boolean;
  onClear: () => void;
}

export const Header = ({ showClearButton, onClear }: HeaderProps) => {
  return (
    <header>
      <h1>AI Issue Agent</h1>
      <p>Generate actionable steps from your project description</p>
      {showClearButton && (
        <button className="clear-button" onClick={onClear}>
          Clear History
        </button>
      )}
    </header>
  );
};

