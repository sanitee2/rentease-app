interface DashboardCardProps {
  title: string;
  content: string;
}

const DashboardCard = ({ title, content }: DashboardCardProps) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-4 text-gray-600">{content}</p>
    </div>
  );
};

export default DashboardCard; 