"use client";

import React from 'react';
import { HelpCircle, BookOpen, Calculator, BarChart3, Download, Settings, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <HelpCircle className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Help - Analiza Kapaciteta Aerodroma
              </h1>
              <p className="text-gray-600 text-lg">
                Kompletan vodič korišćenja aplikacije za analizu kapaciteta
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Introduction */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-blue-600" />
                Uvod u Analizu Kapaciteta
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Ova aplikacija omogućava brzu i efikasnu analizu kapaciteta aerodroma 
                  u skladu sa <strong>Pravilnikom o načinu proširenja i ograničenja kapaciteta aerodroma</strong> 
                  (&quot;Službeni list CG&quot;, broj 30/12).
                </p>
                <p>
                  Analiza se sprovodi kada vazdušni prevoznici koji obavljaju više od polovine 
                  ukupnih operacija na aerodromu smatraju da je kapacitet nedovoljan, ili kada 
                  novi učesnici imaju problema sa obezbjeđivanjem slotova.
                </p>
              </div>
            </section>

            {/* Parameter Sections */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-green-600" />
                Objašnjenje Parametara
              </h2>

              <div className="space-y-6">
                {/* Runway Parameters */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">🛫 Parametri Piste</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Prosječan interval - VMC:</strong> Prosječno vrijeme između operacija u vidljivim vremenskim uslovima (2-3 min)</p>
                    <p><strong>Prosječan interval - IMC:</strong> Prosječno vrijeme između operacija u instrumentalnim uslovima (3-5 min)</p>
                    <p><strong>VMC procenat:</strong> Procenat vremena kada vrijeme VMC uslovi (tipično 60-80%)</p>
                    <p><strong>Faktor mješovitih operacija:</strong> Smanjenje kapaciteta zbog mješovitih dolazaka/odlazaka (0.70-0.85)</p>
                    <p><strong>Sigurnosni faktor:</strong> Dodatna margina sigurnosti (0.80-0.90)</p>
                  </div>
                </div>

                {/* Stand Parameters */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">🅿️ Parametri Platformi</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Contact stands:</strong> Parking pozicije sa direktnim pristupom terminalu (aviomost)</p>
                    <p><strong>Remote stands:</strong> Udaljene parking pozicije sa bus transferom</p>
                    <p><strong>Prosječno vrijeme turnaround:</strong> Vrijeme zauzimanja pozicije po operaciji (25-90 min)</p>
                    <p><strong>Faktor iskorišćenosti:</strong> Stvarno iskorišćenje kapaciteta (0.85-0.95)</p>
                    <p><strong>Radno vrijeme:</strong> Dnevni period operacija (tipično 16-20 sati)</p>
                  </div>
                </div>

                {/* Terminal Parameters */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">🏢 Parametri Terminala</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Broj check-in šaltera:</strong> Ukupan broj šaltera za check-in</p>
                    <p><strong>Broj security lanes:</strong> Broj linija bezbjednosne kontrole</p>
                    <p><strong>Putnika po šalteru/sat:</strong> Kapacitet procesuiranja putnika (20-30 pax/sat)</p>
                    <p><strong>Putnika po security lane/sat:</strong> Propusna moć security (120-180 pax/sat)</p>
                  </div>
                </div>

                {/* Demand Parameters */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">📈 Parametri Potražnje</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Trenutne operacije:</strong> Broj operacija u peak hour (najzagušenijem satu)</p>
                    <p><strong>Stopa rasta:</strong> Očekivani godišnji rast operacija (%)</p>
                    <p><strong>Period projekcije:</strong> Broj godina za projekciju rasta (1-5 godina)</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Calculations */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-purple-600" />
                Metodologija Proračuna
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Kapacitet Piste</h4>
                  <p className="text-blue-700 text-sm">
                    <strong>Formula:</strong> 60 / prosječan interval × faktori × sigurnosna margina
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    <strong>Primjer:</strong> 60 / 2.5 min × 0.80 × 0.85 = 16.3 ≈ 16 op/sat
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Kapacitet Platformi</h4>
                  <p className="text-green-700 text-sm">
                    <strong>Formula:</strong> (Broj pozicija × radno vrijeme / prosječno vrijeme zauzimanja) × faktor iskorišćenosti
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    <strong>Primjer:</strong> (14 × 16h / 0.67h) × 0.90 = 301 operacija/dan
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Kapacitet Terminala</h4>
                  <p className="text-purple-700 text-sm">
                    <strong>Formula:</strong> MIN(check-in kapacitet, security kapacitet)
                  </p>
                  <p className="text-purple-700 text-sm mt-1">
                    <strong>Primjer:</strong> MIN(600 pax/sat, 600 pax/sat) = 600 pax/sat
                  </p>
                </div>
              </div>
            </section>

            {/* Status Interpretation */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-red-600" />
                Interpretacija Rezultata
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">Dovoljan kapacitet (&lt;70%)</h4>
                    <p className="text-green-700 text-sm">Nema potrebe za hitnim mjerama. Nastaviti monitoring.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Približavanje granici (70-85%)</h4>
                    <p className="text-yellow-700 text-sm">Kontinuirani monitoring. Planirati kratkoročne mjere.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-800">Kritično opterećenje (85-95%)</h4>
                    <p className="text-orange-700 text-sm">Hitne kratkoročne mjere. Učestala kašnjenja.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">Prezasićen kapacitet (&gt;95%)</h4>
                    <p className="text-red-700 text-sm">Hitna intervencija! Značajna kašnjenja. Potrebna koordinacija.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Start */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🚀 Brzi Start</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-gray-700 text-sm">Unesite parametre za svoje komponente aerodroma</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-gray-700 text-sm">Pregledajte automatski izračunate kapacitete</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-gray-700 text-sm">Analizirajte status i preporuke</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <p className="text-gray-700 text-sm">Preuzmite detaljan izvještaj</p>
                </div>
              </div>
            </div>

            {/* Tips & Best Practices */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">💡 Savjeti</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Realni podaci:</strong> Koristite stvarne operativne podaje za tačnije rezultate
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-800 text-sm">
                    <strong>Peak hour analiza:</strong> Fokusirajte se na najzagušenije sate
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-purple-800 text-sm">
                    <strong>Sezonalnost:</strong> Uzmite u obzir sezonske varijacije u potražnji
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-orange-800 text-sm">
                    <strong>Multiple scenariji:</strong> Testirajte različite stope rasta
                  </p>
                </div>
              </div>
            </div>

            {/* Report Features */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Izvještaj
              </h3>
              <div className="space-y-2 text-gray-700">
                <p className="text-sm">Generisani izvještaj uključuje:</p>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>Ulazne parametre</li>
                  <li>Detaljne proračune</li>
                  <li>Analizu iskorišćenosti</li>
                  <li>Projekcije rasta</li>
                  <li>Preporuke za akciju</li>
                  <li>Zaključak analize</li>
                </ul>
              </div>
            </div>

            {/* Legal Framework */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                Pravni Okvir
              </h3>
              <div className="space-y-2 text-gray-700">
                <p className="text-sm">
                  Analiza je usklađena sa Pravilnikom o načinu proširenja i ograničenja 
                  kapaciteta aerodroma (&quot;Službeni list CG&quot;, broj 30/12).
                </p>
                <p className="text-sm">
                  Rok za sprovođenje analize: <strong>6 mjeseci</strong> od pisanog zahtjeva.
                </p>
              </div>
            </div>

            {/* Support */}
            <div className="bg-blue-50 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4">📞 Podrška</h3>
              <div className="space-y-2 text-blue-700">
                <p className="text-sm">
                  Za dodatna pitanja ili tehničku podršku, kontaktirajte:
                </p>
                <p className="text-sm font-semibold">
                  Kolegijum u kafanu
                </p>
                <p className="text-sm">
                  Email: info@Kolegijum-u-kafanu.me
                </p>
                <p className="text-sm">
                  Tel: +382 20 XXX XXX
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            © 2024 Kolegijum u kafanu
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;