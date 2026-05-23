const StatsCard = ({ title, value, icon, color = 'primary', trend }) => {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dark-500">{title}</p>
          <p className="text-2xl font-bold text-dark-900 mt-1">{value}</p>
          {trend && <p className="text-xs text-dark-400 mt-1">{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
