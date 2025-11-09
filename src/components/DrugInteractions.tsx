'use client';

import { useState, useMemo } from 'react';
import { Search, AlertTriangle, CheckCircle, X, Pill } from 'lucide-react';

interface Drug {
  id: string;
  name: string;
  type: string;
}

interface Interaction {
  drugs: string[];
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

interface DrugInteractionsProps {
  language: 'montenegrin' | 'english';
}

interface DrugTranslations {
  title: string;
  searchPlaceholder: string;
  selectedDrugs: string;
  interactions: string;
  noInteractions: string;
  addDrug: string;
  remove: string;
  severity: {
    high: string;
    medium: string;
    low: string;
  };
}

const drugTranslations: Record<'montenegrin' | 'english', DrugTranslations> = {
  montenegrin: {
    title: 'Provjera Interakcija Lijekova',
    searchPlaceholder: 'Pretraži lijekove...',
    selectedDrugs: 'Odabrani lijekovi',
    interactions: 'Interakcije',
    noInteractions: 'Nema značajnih interakcija',
    addDrug: 'Dodaj lijek',
    remove: 'Ukloni',
    severity: {
      high: 'Visok rizik',
      medium: 'Srednji rizik',
      low: 'Nizak rizik'
    }
  },
  english: {
    title: 'Drug Interactions Checker',
    searchPlaceholder: 'Search drugs...',
    selectedDrugs: 'Selected Drugs',
    interactions: 'Interactions',
    noInteractions: 'No significant interactions',
    addDrug: 'Add Drug',
    remove: 'Remove',
    severity: {
      high: 'High Risk',
      medium: 'Medium Risk',
      low: 'Low Risk'
    }
  }
};

export default function DrugInteractions({ language }: DrugInteractionsProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const t = drugTranslations[language];

  // Sample drug database
  const drugDatabase: Drug[] = useMemo(() => [
    { id: '1', name: 'Aspirin', type: 'NSAID' },
    { id: '2', name: 'Warfarin', type: 'Antikoagulant' },
    { id: '3', name: 'Metformin', type: 'Antidijabetik' },
    { id: '4', name: 'Lisinopril', type: 'ACE inhibitor' },
    { id: '5', name: 'Atorvastatin', type: 'Statin' },
    { id: '6', name: 'Insulin', type: 'Hormon' },
    { id: '7', name: 'Ibuprofen', type: 'NSAID' },
    { id: '8', name: 'Omeprazole', type: 'PPI' }
  ], []);

  // Sample interactions
  const interactions: Interaction[] = useMemo(() => [
    {
      drugs: ['Aspirin', 'Warfarin'],
      severity: 'high',
      description: 'Povećan rizik od krvarenja',
      recommendation: 'Zahtijeva pažljivo praćenje INR vrijednosti'
    },
    {
      drugs: ['Aspirin', 'Ibuprofen'],
      severity: 'medium',
      description: 'Povećan rizik od gastrointestinalnog krvarenja',
      recommendation: 'Izbjegavati konkomitantnu upotrebu'
    }
  ], []);

  const filteredDrugs = useMemo(() => 
    drugDatabase.filter(drug =>
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.type.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [drugDatabase, searchTerm]
  );

  const addDrug = (drug: Drug): void => {
    if (!selectedDrugs.find(d => d.id === drug.id)) {
      setSelectedDrugs(prev => [...prev, drug]);
    }
    setSearchTerm('');
  };

  const removeDrug = (drugId: string): void => {
    setSelectedDrugs(prev => prev.filter(d => d.id !== drugId));
  };

  const foundInteractions = useMemo(() => 
    interactions.filter(interaction =>
      interaction.drugs.every(drugName =>
        selectedDrugs.some(drug => drug.name === drugName)
      )
    ),
    [interactions, selectedDrugs]
  );

  const getSeverityColor = (severity: Interaction['severity']): string => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
      medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    };
    return colors[severity];
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Pill className="w-6 h-6 text-blue-500" />
          {t.title}
        </h3>
      </div>

      {/* Search and Add Drug */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        
        {searchTerm && filteredDrugs.length > 0 && (
          <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto">
            {filteredDrugs.map(drug => (
              <button
                key={drug.id}
                onClick={() => addDrug(drug)}
                className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center justify-between"
                type="button"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{drug.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{drug.type}</div>
                </div>
                <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                  {t.addDrug}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Drugs */}
      {selectedDrugs.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">{t.selectedDrugs}:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedDrugs.map(drug => (
              <div
                key={drug.id}
                className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-2 rounded-lg"
              >
                <span className="font-medium">{drug.name}</span>
                <button
                  onClick={() => removeDrug(drug.id)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                  type="button"
                  aria-label={`Remove ${drug.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactions */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">{t.interactions}:</h4>
        
        {foundInteractions.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">{t.noInteractions}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {foundInteractions.map((interaction, index) => (
              <div
                key={`${interaction.drugs.join('-')}-${index}`}
                className={`border-2 rounded-xl p-4 ${getSeverityColor(interaction.severity)}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">
                    {interaction.drugs.join(' + ')}
                  </span>
                  <span className="ml-auto text-sm font-medium px-2 py-1 rounded-full bg-white/50 dark:bg-black/20">
                    {t.severity[interaction.severity]}
                  </span>
                </div>
                <p className="text-sm mb-2">{interaction.description}</p>
                <p className="text-sm font-medium">{interaction.recommendation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}