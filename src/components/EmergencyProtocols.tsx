'use client';

import { useState } from 'react';
import { AlertTriangle, Heart, Brain, Droplets, Shield, Clock, ChevronDown, ChevronUp, Thermometer, Zap, Battery, Activity, Droplet, Pill,  Skull } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Protocol {
  id: string;
  title: string;
  description: string;
  steps: string[];
  criticalTime: string;
  icon: LucideIcon;
  color: 'red' | 'purple' | 'orange' | 'blue' | 'green' | 'yellow';
}

interface EmergencyProtocolsProps {
  language: 'montenegrin' | 'english';
}

interface ProtocolTranslations {
  title: string;
  searchPlaceholder: string;
  criticalTime: string;
  steps: string;
  showAll: string;
  showLess: string;
  source: string;
  protocols: {
    cardiacArrest: Omit<Protocol, 'id' | 'icon' | 'color'>;
    stroke: Omit<Protocol, 'id' | 'icon' | 'color'>;
    bleeding: Omit<Protocol, 'id' | 'icon' | 'color'>;
    dehydration: Omit<Protocol, 'id' | 'icon' | 'color'>;
    diabeticEmergency: Omit<Protocol, 'id' | 'icon' | 'color'>;
    electricalInjury: Omit<Protocol, 'id' | 'icon' | 'color'>;
    hypothermia: Omit<Protocol, 'id' | 'icon' | 'color'>;
    seizure: Omit<Protocol, 'id' | 'icon' | 'color'>;
    shock: Omit<Protocol, 'id' | 'icon' | 'color'>;
    poisoning: Omit<Protocol, 'id' | 'icon' | 'color'>;
  };
}

const protocolTranslations: Record<'montenegrin' | 'english', ProtocolTranslations> = {
  montenegrin: {
    title: 'Protokoli za Hitne Slučajeve',
    searchPlaceholder: 'Pretraži protokole...',
    criticalTime: 'Kritično vrijeme',
    steps: 'Koraci',
    showAll: 'Prikaži sve protokole',
    showLess: 'Prikaži manje',
    source: 'Izvor: Forest Service U.S. DEPARTMENT OF AGRICULTURE | National Emergency Medical Services Program Office | October 2024',
    protocols: {
      cardiacArrest: {
        title: 'Srčani Zastoj',
        description: 'Postupak za slučajeve srčanog zastoja',
        steps: [
          'Procijeni sigurnost scene i pacijenta',
          'Provjeri svijest i disanje',
          'Započni CPR (30 kompresija : 2 udisaja). Stavite podnožje vaše šake na centar grudnog koša osobe, zatim dlan druge ruke stavite preko prve i pritiskajte dolje za 5 do 6 cm ujednačenim tempom od 100 do 120 pritisaka u minuti. Nakon svakih 30 pritisaka na grudni koš, dajte 2 spasilačka udisaja.',
          'Koristi AED čim bude dostupan',
          'Nastavi dok ne stigne hitna pomoć'
        ],
        criticalTime: '0-4 minuta'
      },
      stroke: {
        title: 'Moždani Udar',
        description: 'Brza procjena i odgovor na moždaní udar',
        steps: [
          'Koristi FAST test (Face, Arms, Speech, Time)',
          'Pitaj da se nasmiješi (asimertija lica)',
          'Pitaj da podigne obje ruke (slabost jedne strane)',
          'Pitaj da ponovi jednostavnu rečenicu',
          'Zabilježi vrijeme početka simptoma',
          'Hitno transportuj u bolnicu'
        ],
        criticalTime: '0-3 sata'
      },
      bleeding: {
        title: 'Ozbiljno Krvarenje',
        description: 'Kontrola obilnog krvarenja',
        steps: [
          'Nosite rukavice za zaštitu',
          'Pritisni direktno na ranu',
          'Podigni povrijeđeni dio iznad srca',
          'Koristi kompresioni zavoj ako je potrebno',
          'Prati znakove šoka',
          'Traži hitnu medicinsku pomoć'
        ],
        criticalTime: '0-5 minuta'
      },
      dehydration: {
        title: 'Dehidratacija',
        description: 'Postupak za tretman dehidratacije',
        steps: [
          'Procijeni stepen dehidratacije (suha usta, smanjeno uriniranje, umor)',
          'Pacijentu dati oralnu tečnost ako je pri svijesti i može da guta',
          'Koristiti oralne rehidracione tečnosti ili sportskie napitke',
          'Ako je teška dehidratacija, tražiti hitnu medicinsku pomoć za IV tečnosti',
          'Pratiti vitalne znakove i stanje svijesti',
          'Smanjiti fizičku aktivnost i odmoriti se na hladnom mjestu'
        ],
        criticalTime: '0-2 sata'
      },
      diabeticEmergency: {
        title: 'Dijabetička Kriza',
        description: 'Postupak za hipoglikemiju i hiperglikemiju',
        steps: [
          'Procijeni simptome (znojenje, drhtavica - nizak šećer; suva koža, često mokrenje - visok šećer)',
          'Ako je pri svijesti i može da guta, dati 15-20g brzih ugljenih hidrata (sok, tablete glukoze)',
          'Ponoviti merenje šećera u krvi za 15 minuta',
          'Ako je bez svijesti, NE davati ništa na usta',
          'Pozvati hitnu pomoć za teške slučajeve',
          'Pratiti stanje dok ne stigne pomoć'
        ],
        criticalTime: '0-15 minuta'
      },
      electricalInjury: {
        title: 'Električne Povrede',
        description: 'Postupak za povrede od električne struje',
        steps: [
          'OSIGURAJ SCENU - isključi struju prije pristupa pacijentu',
          'Koristi neprovodni materijal za udaljavanje pacijenta od izvora struje',
          'Procijeni ABC (Airway, Breathing, Circulation)',
          'Traži traume na ulaznoj i izlaznoj tački struje',
          'Pacijent može imati unutrašnje oštećenje koje nije vidljivo',
          'Traži hitnu medicinsku pomoć - svi slučajevi električnih povreda zahtijevaju evaluaciju'
        ],
        criticalTime: '0-5 minuta'
      },
      hypothermia: {
        title: 'Hipotermija',
        description: 'Postupak za tretman hipotermije',
        steps: [
          'Premjesti pacijenta u toplo, suho okruženje',
          'Skini mokru odjeću i pokrij toplim pokrivačima',
          'Ako je pri svijesti, dati tople nealkoholne tečnosti',
          'IZBJEGAVAJI brzo zagrijavanje i direktan kontakt s vrućim predmetima',
          'Pratiti disanje i puls - mogu biti vrlo spori',
          'Traži hitnu medicinsku pomoć za teške slučajeve (temperatura ispod 32°C)'
        ],
        criticalTime: '0-30 minuta'
      },
      seizure: {
        title: 'Napadaji/Epilepsija',
        description: 'Postupak za upravljanje napadajima',
        steps: [
          'Zaštiti pacijenta od povreda - ukloni oštre predmete',
          'Stavi nešto meko pod glavu',
          'NE stavljati ništa u usta',
          'NE držati pacijenta tokom napadaja',
          'Prati trajanje napadaja',
          'Nakon napadaja, staviti u bočni položaj i pratiti disanje',
          'Traži hitnu pomoć ako: napadaj traje duže od 5 minuta, ponavlja se, ili je prvi napadaj'
        ],
        criticalTime: '0-5 minuta'
      },
      shock: {
        title: 'Šok/Hipotenzija',
        description: 'Postupak za upravljanje šokom',
        steps: [
          'Pozovi hitnu medicinsku pomoć',
          'Pacijenta staviti u ležeći položaj sa podignutim nogama (osim ako ima povredu glave, vrata ili leda)',
          'Održavaj toplotu - pokrij pokrivačima',
          'NE davati ništa na usta',
          'Pratiti vitalne znakove svakih 5 minuta',
          'Ako postoji vidljivo krvarenje, pritisni direktno na ranu',
          'Pripremi se za CPR ako je potrebno'
        ],
        criticalTime: '0-10 minuta'
      },
      poisoning: {
        title: 'Trovanje Alkoholom/Drogama',
        description: 'Postupak za trovanje supstancama',
        steps: [
          'Procijeni sigurnost scene i identifikuj potencijalne toksine',
          'Provjeri svijest, disanje i vitalne znakove',
          'Ako je pri svijesti, pitaj šta je unio/la i koliko',
          'NE izazivati povraćanje osim ako nije eksplicitno preporučeno od strane stručnjaka',
          'Prikupi sve boce, kontejnere ili dokaze o supstanci',
          'Pozovi hitnu pomoć i centar za trovanje',
          'Prati stanje svijesti i disanja - pripremi se za CPR ako je potrebno'
        ],
        criticalTime: '0-15 minuta'
      }
    }
  },
  english: {
    title: 'Emergency Protocols',
    searchPlaceholder: 'Search protocols...',
    criticalTime: 'Critical Time',
    steps: 'Steps',
    showAll: 'Show all protocols',
    showLess: 'Show less',
    source: 'Source: Forest Service U.S. DEPARTMENT OF AGRICULTURE | National Emergency Medical Services Program Office | October 2024',
    protocols: {
      cardiacArrest: {
        title: 'Cardiac Arrest',
        description: 'Procedure for cardiac arrest cases',
        steps: [
          'Assess scene and patient safety',
          'Check consciousness and breathing',
          'Begin CPR (30 compressions : 2 breaths). Place the heel of your hand on the centre of the persons chest, then place the palm of your other hand on top and press down by 5 to 6cm at a steady rate of 100 to 120 compressions a minute. After every 30 chest compressions, give 2 rescue breaths',
          'Use AED as soon as available',
          'Continue until emergency services arrive'
        ],
        criticalTime: '0-4 minutes'
      },
      stroke: {
        title: 'Stroke',
        description: 'Rapid assessment and response for stroke',
        steps: [
          'Use FAST test (Face, Arms, Speech, Time)',
          'Ask to smile (facial asymmetry)',
          'Ask to raise both arms (one-sided weakness)',
          'Ask to repeat a simple sentence',
          'Record time of symptom onset',
          'Transport urgently to hospital'
        ],
        criticalTime: '0-3 hours'
      },
      bleeding: {
        title: 'Severe Bleeding',
        description: 'Control of heavy bleeding',
        steps: [
          'Wear gloves for protection',
          'Apply direct pressure to wound',
          'Elevate injured part above heart',
          'Use pressure bandage if needed',
          'Monitor for signs of shock',
          'Seek emergency medical help'
        ],
        criticalTime: '0-5 minutes'
      },
      dehydration: {
        title: 'Dehydration',
        description: 'Procedure for dehydration treatment',
        steps: [
          'Assess dehydration level (dry mouth, decreased urination, fatigue)',
          'Give oral fluids if conscious and able to swallow',
          'Use oral rehydration solutions or sports drinks',
          'If severe dehydration, seek emergency medical help for IV fluids',
          'Monitor vital signs and consciousness',
          'Reduce physical activity and rest in cool place'
        ],
        criticalTime: '0-2 hours'
      },
      diabeticEmergency: {
        title: 'Diabetic Emergency',
        description: 'Procedure for hypoglycemia and hyperglycemia',
        steps: [
          'Assess symptoms (sweating, shaking - low sugar; dry skin, frequent urination - high sugar)',
          'If conscious and able to swallow, give 15-20g fast-acting carbs (juice, glucose tablets)',
          'Repeat blood sugar measurement after 15 minutes',
          'If unconscious, DO NOT give anything by mouth',
          'Call emergency services for severe cases',
          'Monitor condition until help arrives'
        ],
        criticalTime: '0-15 minutes'
      },
      electricalInjury: {
        title: 'Electrical Injuries',
        description: 'Procedure for electrical shock injuries',
        steps: [
          'SECURE THE SCENE - turn off power before approaching patient',
          'Use non-conductive material to move patient from power source',
          'Assess ABC (Airway, Breathing, Circulation)',
          'Look for trauma at entry and exit points of electricity',
          'Patient may have internal damage not visible externally',
          'Seek emergency medical help - all electrical injuries require evaluation'
        ],
        criticalTime: '0-5 minutes'
      },
      hypothermia: {
        title: 'Hypothermia',
        description: 'Procedure for hypothermia treatment',
        steps: [
          'Move patient to warm, dry environment',
          'Remove wet clothing and cover with warm blankets',
          'If conscious, give warm non-alcoholic fluids',
          'AVOID rapid rewarming and direct contact with hot objects',
          'Monitor breathing and pulse - may be very slow',
          'Seek emergency medical help for severe cases (temperature below 32°C)'
        ],
        criticalTime: '0-30 minutes'
      },
      seizure: {
        title: 'Seizures/Epilepsy',
        description: 'Procedure for seizure management',
        steps: [
          'Protect patient from injury - remove sharp objects',
          'Place something soft under head',
          'DO NOT put anything in mouth',
          'DO NOT restrain patient during seizure',
          'Time the duration of seizure',
          'After seizure, place in recovery position and monitor breathing',
          'Seek emergency help if: seizure lasts longer than 5 minutes, repeats, or is first seizure'
        ],
        criticalTime: '0-5 minutes'
      },
      shock: {
        title: 'Shock/Hypotension',
        description: 'Procedure for shock management',
        steps: [
          'Call emergency medical services',
          'Place patient in lying position with legs elevated (unless head, neck or back injury)',
          'Maintain warmth - cover with blankets',
          'DO NOT give anything by mouth',
          'Monitor vital signs every 5 minutes',
          'If visible bleeding, apply direct pressure to wound',
          'Be prepared for CPR if needed'
        ],
        criticalTime: '0-10 minutes'
      },
      poisoning: {
        title: 'Alcohol/Drug Poisoning',
        description: 'Procedure for substance poisoning',
        steps: [
          'Assess scene safety and identify potential toxins',
          'Check consciousness, breathing and vital signs',
          'If conscious, ask what was taken and how much',
          'DO NOT induce vomiting unless explicitly recommended by poison control',
          'Collect all bottles, containers or substance evidence',
          'Call emergency services and poison control center',
          'Monitor consciousness and breathing - be prepared for CPR if needed'
        ],
        criticalTime: '0-15 minutes'
      }
    }
  }
};

export default function EmergencyProtocols({ language }: EmergencyProtocolsProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);
  const [showAllProtocols, setShowAllProtocols] = useState<boolean>(false);
  const t = protocolTranslations[language];

  const protocols: Protocol[] = [
    {
      id: 'cardiacArrest',
      icon: Heart,
      color: 'red',
      ...t.protocols.cardiacArrest
    },
    {
      id: 'stroke',
      icon: Brain,
      color: 'purple',
      ...t.protocols.stroke
    },
    {
      id: 'bleeding',
      icon: Droplets,
      color: 'orange',
      ...t.protocols.bleeding
    },
    {
      id: 'dehydration',
      icon: Droplet,
      color: 'blue',
      ...t.protocols.dehydration
    },
    {
      id: 'diabeticEmergency',
      icon: Pill,
      color: 'yellow',
      ...t.protocols.diabeticEmergency
    },
    {
      id: 'electricalInjury',
      icon: Zap,
      color: 'orange',
      ...t.protocols.electricalInjury
    },
    {
      id: 'hypothermia',
      icon: Thermometer,
      color: 'blue',
      ...t.protocols.hypothermia
    },
    {
      id: 'seizure',
      icon: Activity,
      color: 'purple',
      ...t.protocols.seizure
    },
    {
      id: 'shock',
      icon: Battery,
      color: 'red',
      ...t.protocols.shock
    },
    {
      id: 'poisoning',
      icon: Skull,
      color: 'green',
      ...t.protocols.poisoning
    }
  ];

  const filteredProtocols = protocols.filter(protocol =>
    protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    protocol.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show only 3 protocols initially, or all if showAllProtocols is true or search is active
  const displayedProtocols = searchTerm ? filteredProtocols : (showAllProtocols ? protocols : protocols.slice(0, 3));

  const getColorClasses = (color: Protocol['color']): string => {
    const colors = {
      red: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      purple: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
      orange: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
      blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      green: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
    };
    return colors[color];
  };

  const getIconColor = (color: Protocol['color']): string => {
    const colors = {
      red: 'text-red-600 dark:text-red-400',
      purple: 'text-purple-600 dark:text-purple-400',
      orange: 'text-orange-600 dark:text-orange-400',
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      yellow: 'text-yellow-600 dark:text-yellow-400'
    };
    return colors[color];
  };

  const handleProtocolToggle = (protocolId: string): void => {
    setExpandedProtocol(expandedProtocol === protocolId ? null : protocolId);
  };

  const toggleShowAllProtocols = (): void => {
    setShowAllProtocols(!showAllProtocols);
  };

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          {t.title}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {displayedProtocols.length} {language === 'montenegrin' ? 'protokola' : 'protocols'}
        </span>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Protocols List */}
      <div className="space-y-4">
        {displayedProtocols.map((protocol) => (
          <div
            key={protocol.id}
            className={`border-2 rounded-xl transition-all duration-300 ${getColorClasses(protocol.color)}`}
          >
            <button
              onClick={() => handleProtocolToggle(protocol.id)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors rounded-xl"
              type="button"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-opacity-50 dark:bg-opacity-30 ${getColorClasses(protocol.color).replace('50', '100').replace('900/20', '800/40')}`}>
                  <protocol.icon className={`w-6 h-6 ${getIconColor(protocol.color)}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {protocol.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {protocol.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{t.criticalTime}: {protocol.criticalTime}</span>
                </div>
                {expandedProtocol === protocol.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {expandedProtocol === protocol.id && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{t.steps}:</span>
                </div>
                <ol className="space-y-3">
                  {protocol.steps.map((step, index) => (
                    <li key={`${protocol.id}-step-${index}`} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm flex items-center justify-center font-medium mt-0.5">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {!searchTerm && protocols.length > 3 && (
        <div className="mt-6 text-center">
          <button
            onClick={toggleShowAllProtocols}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
            type="button"
          >
            {showAllProtocols ? (
              <>
                <ChevronUp className="w-4 h-4" />
                {t.showLess}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {t.showAll}
              </>
            )}
          </button>
        </div>
      )}

      {/* Source Information */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t.source}
        </p>
      </div>

      {filteredProtocols.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {language === 'montenegrin' 
            ? 'Nema pronađenih protokola' 
            : 'No protocols found'
          }
        </div>
      )}
    </div>
  );
}