import React from 'react';
import { Milestone } from '../types';
import { Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  // Sort milestones by date descending
  const sortedMilestones = React.useMemo(() => 
    [...milestones].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  , [milestones]);

  // Group by year
  const groupedByYear = React.useMemo(() => {
    const groups: { [key: string]: Milestone[] } = {};
    sortedMilestones.forEach(m => {
      const year = new Date(m.date).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(m);
    });
    return groups;
  }, [sortedMilestones]);

  const years = React.useMemo(() => 
    Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a))
  , [groupedByYear]);

  // JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Timeline",
    "name": "食在力量大事記",
    "description": "記錄食在力量的每一個重要時刻與里程碑",
    "event": sortedMilestones.map(m => ({
      "@type": "Event",
      "name": m.title,
      "startDate": m.date,
      "description": m.description || m.title,
      "image": m.picture
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            食在力量大事記
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            記錄食在力量的每一個重要時刻與里程碑
          </p>
        </header>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-red-200" aria-hidden="true"></div>

          <div className="space-y-8">
            {years.map((year) => (
              <section key={year} className="relative" aria-labelledby={`year-${year}`}>
                {/* Year Header */}
                <div className="flex justify-start md:justify-center mb-4">
                  <div id={`year-${year}`} className="relative z-10 bg-red-600 text-white px-6 py-2 rounded-full font-bold text-xl shadow-lg">
                    {year}
                  </div>
                </div>

                <div className="space-y-4">
                  {groupedByYear[year].map((milestone, index) => (
                    <motion.article
                      key={milestone.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`relative flex flex-col md:flex-row items-start md:items-center ${
                        index % 2 === 0 ? 'md:flex-row-reverse' : ''
                      }`}
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-4 border-red-600 rounded-full z-10" aria-hidden="true"></div>

                      {/* Content Card */}
                      <div className={`w-full md:w-5/12 ml-10 md:ml-0 ${index % 2 === 0 ? 'md:pl-8' : 'md:pr-8'}`}>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 text-red-600 font-bold text-sm mb-2">
                            <Calendar size={16} aria-hidden="true" />
                            <time dateTime={milestone.date}>{milestone.date}</time>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">{milestone.title}</h3>
                          {milestone.picture && (
                            <div className="mb-4 overflow-hidden rounded-xl bg-gray-100 aspect-video">
                              <img
                                src={milestone.picture}
                                alt={milestone.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                width="800"
                                height="450"
                              />
                            </div>
                          )}
                          {milestone.description && (
                            <p className="text-gray-600 leading-relaxed">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-8 h-px bg-gray-200"></div>
            <span>未完待續</span>
            <div className="w-8 h-px bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneTimeline;
