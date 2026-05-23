const EmptyState = ({ icon = '📋', title = 'No data found', message = 'There are no records to display at this time.' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-5xl mb-4">{icon}</span>
    <h3 className="text-lg font-semibold text-dark-700 mb-1">{title}</h3>
    <p className="text-sm text-dark-400 max-w-sm">{message}</p>
  </div>
);

export default EmptyState;
