'use client';

import DashboardCard from './DashboardCard';

const DashboardContent = () => {
  const cards = [
    { title: 'Card 1', content: 'Content 1' },
    { title: 'Card 2', content: 'Content 2' },
    { title: 'Card 3', content: 'Content 3' },
    { title: 'Card 4', content: 'Content 4' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <DashboardCard 
          key={index}
          title={card.title}
          content={card.content}
        />
      ))}
    </div>
  );
};

export default DashboardContent; 