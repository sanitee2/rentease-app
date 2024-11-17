'use client';

import { IconType } from "react-icons";
import { FaPaw, FaSmokingBan, FaBaby } from 'react-icons/fa';
import { MdNightlife } from 'react-icons/md';
import { BsPersonCheck } from 'react-icons/bs';

interface HouseRulesProps {
  rules: {
    petsAllowed: boolean;
    childrenAllowed: boolean;
    smokingAllowed: boolean;
    additionalNotes?: string | null;
  };
  hasAgeRequirement: boolean;
  minimumAge?: number | null;
  overnightGuestsAllowed: boolean;
}

interface RuleItemProps {
  icon: IconType;
  label: string;
  allowed: boolean;
}
const createMarkup = (content: string | null) => {
  if (!content) return { __html: '' };
  return { __html: content };
};

const RuleItem: React.FC<RuleItemProps> = ({ icon: Icon, label, allowed }) => {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${allowed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        <Icon size={20} />
      </div>
      <div className="flex flex-col">
        <span className="text-gray-700">{label}</span>
        <span className={`text-sm ${allowed ? 'text-green-600' : 'text-red-600'}`}>
          {allowed ? 'Allowed' : 'Not Allowed'}
        </span>
      </div>
    </div>
  );
};

const HouseRules: React.FC<HouseRulesProps> = ({
  rules,
  hasAgeRequirement,
  minimumAge,
  overnightGuestsAllowed,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">House Rules</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RuleItem 
          icon={FaPaw}
          label="Pets"
          allowed={rules.petsAllowed}
        />
        <RuleItem 
          icon={FaBaby}
          label="Children"
          allowed={rules.childrenAllowed}
        />
        <RuleItem 
          icon={FaSmokingBan}
          label="Smoking"
          allowed={rules.smokingAllowed}
        />
        <RuleItem 
          icon={MdNightlife}
          label="Overnight Guests"
          allowed={overnightGuestsAllowed}
        />
      </div>

      {hasAgeRequirement && (
        <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg">
          <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
            <BsPersonCheck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-700 font-medium">Age Requirement</span>
            <span className="text-sm text-indigo-600">
              Minimum age: {minimumAge} years old
            </span>
          </div>
        </div>
      )}

      {rules?.additionalNotes && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Additional Notes</h3>
              <div 
                className="prose prose-sm text-gray-600 max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-600"
                dangerouslySetInnerHTML={createMarkup(rules.additionalNotes)}
              />
            </div>
          )}
    </div>
  );
};

export default HouseRules;