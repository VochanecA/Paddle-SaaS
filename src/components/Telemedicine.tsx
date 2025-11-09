'use client';

import { useState, useMemo } from 'react';
import { Video, Phone, MessageCircle, Calendar, Clock, Star, MapPin, User } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  languages: string[];
  availableSlots: string[];
  consultationFee: number;
  image?: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  type: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface TelemedicineProps {
  language: 'montenegrin' | 'english';
}

interface TelemedicineTranslations {
  title: string;
  searchPlaceholder: string;
  specialties: string;
  bookConsultation: string;
  availableSlots: string;
  consultationFee: string;
  languages: string;
  experience: string;
  years: string;
  rating: string;
  videoCall: string;
  audioCall: string;
  chat: string;
  bookNow: string;
  myAppointments: string;
  noAppointments: string;
  upcoming: string;
  completed: string;
  joinCall: string;
  cancel: string;
  reschedule: string;
}

const telemedicineTranslations: Record<'montenegrin' | 'english', TelemedicineTranslations> = {
  montenegrin: {
    title: 'Telemedicina',
    searchPlaceholder: 'Pretraži doktore po specijalnosti...',
    specialties: 'Specijalnosti',
    bookConsultation: 'Zakaži Konsultaciju',
    availableSlots: 'Dostupni termini',
    consultationFee: 'Cijena konsultacije',
    languages: 'Jezici',
    experience: 'Iskustvo',
    years: 'godina',
    rating: 'Ocjena',
    videoCall: 'Video Poziv',
    audioCall: 'Audio Poziv',
    chat: 'Chat',
    bookNow: 'Zakaži Sada',
    myAppointments: 'Moji Termini',
    noAppointments: 'Nema zakazanih termina',
    upcoming: 'Predstojeći',
    completed: 'Završeni',
    joinCall: 'Pridruži se Pozivu',
    cancel: 'Otkaži',
    reschedule: 'Zakaži Ponovo'
  },
  english: {
    title: 'Telemedicine',
    searchPlaceholder: 'Search doctors by specialty...',
    specialties: 'Specialties',
    bookConsultation: 'Book Consultation',
    availableSlots: 'Available Slots',
    consultationFee: 'Consultation Fee',
    languages: 'Languages',
    experience: 'Experience',
    years: 'years',
    rating: 'Rating',
    videoCall: 'Video Call',
    audioCall: 'Audio Call',
    chat: 'Chat',
    bookNow: 'Book Now',
    myAppointments: 'My Appointments',
    noAppointments: 'No appointments scheduled',
    upcoming: 'Upcoming',
    completed: 'Completed',
    joinCall: 'Join Call',
    cancel: 'Cancel',
    reschedule: 'Reschedule'
  }
};

export default function Telemedicine({ language }: TelemedicineProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'doctors' | 'appointments'>('doctors');
  const t = telemedicineTranslations[language];

  // Sample doctors database
  const doctors: Doctor[] = useMemo(() => [
    {
      id: '1',
      name: 'Dr. Marko Petrović',
      specialty: 'Kardiolog',
      rating: 4.8,
      experience: 12,
      languages: ['Crnogorski', 'Engleski'],
      availableSlots: ['09:00', '11:00', '14:00', '16:00'],
      consultationFee: 50
    },
    {
      id: '2',
      name: 'Dr. Ana Marković',
      specialty: 'Dermatolog',
      rating: 4.9,
      experience: 8,
      languages: ['Crnogorski', 'Engleski', 'Njemački'],
      availableSlots: ['10:00', '13:00', '15:00'],
      consultationFee: 45
    },
    {
      id: '3',
      name: 'Dr. Ivan Nikolić',
      specialty: 'Pedijatar',
      rating: 4.7,
      experience: 15,
      languages: ['Crnogorski', 'Engleski'],
      availableSlots: ['08:00', '12:00', '17:00'],
      consultationFee: 40
    },
    {
      id: '4',
      name: 'Dr. Sara Jovanović',
      specialty: 'Psihijatar',
      rating: 4.9,
      experience: 10,
      languages: ['Crnogorski', 'Engleski', 'Francuski'],
      availableSlots: ['14:00', '16:00', '18:00'],
      consultationFee: 60
    }
  ], []);

  const specialties = useMemo(() => 
    ['all', ...Array.from(new Set(doctors.map(doctor => doctor.specialty)))],
    [doctors]
  );

  const filteredDoctors = useMemo(() => 
    doctors.filter(doctor =>
      (selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty) &&
      (doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [doctors, selectedSpecialty, searchTerm]
  );

  const bookAppointment = (doctor: Doctor, time: string, type: 'video' | 'audio' | 'chat'): void => {
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      doctorId: doctor.id,
      date: new Date().toISOString().split('T')[0],
      time,
      type,
      status: 'scheduled'
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    setSelectedDoctor(null);
    setActiveTab('appointments');
  };

  const cancelAppointment = (appointmentId: string): void => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  };

  const getDoctorById = (doctorId: string): Doctor | undefined => {
    return doctors.find(doctor => doctor.id === doctorId);
  };

  const upcomingAppointments = appointments.filter(apt => apt.status === 'scheduled');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Video className="w-6 h-6 text-blue-500" />
          {t.title}
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'doctors'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {t.bookConsultation}
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'appointments'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {t.myAppointments}
          </button>
        </div>
      </div>

      {activeTab === 'doctors' ? (
        <>
          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {specialties.map(specialty => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedSpecialty === specialty
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {specialty === 'all' ? 'Sve' : specialty}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors List */}
          <div className="space-y-4">
            {filteredDoctors.map(doctor => (
              <div
                key={doctor.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {doctor.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">{doctor.specialty}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{doctor.rating}</span>
                        </div>
                        <div>
                          {t.experience}: {doctor.experience} {t.years}
                        </div>
                        <div className="text-green-600 dark:text-green-400 font-medium">
                          {t.consultationFee}: €{doctor.consultationFee}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {doctor.languages.map(lang => (
                          <span
                            key={lang}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {t.bookNow}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Modal */}
          {selectedDoctor && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">
                  {t.bookConsultation} - {selectedDoctor.name}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t.availableSlots}:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDoctor.availableSlots.map(slot => (
                        <button
                          key={slot}
                          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center"
                          onClick={() => bookAppointment(selectedDoctor, slot, 'video')}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => bookAppointment(selectedDoctor, selectedDoctor.availableSlots[0], 'video')}
                      className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      {t.videoCall}
                    </button>
                    <button
                      onClick={() => bookAppointment(selectedDoctor, selectedDoctor.availableSlots[0], 'audio')}
                      className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {t.audioCall}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Appointments Tab */
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t.upcoming}:</h4>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">{t.noAppointments}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map(appointment => {
                  const doctor = getDoctorById(appointment.doctorId);
                  return (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold">{doctor?.name}</h5>
                          <p className="text-gray-600 dark:text-gray-400">{doctor?.specialty}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {appointment.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {appointment.time}
                            </div>
                            <div className="flex items-center gap-1">
                              {appointment.type === 'video' && <Video className="w-4 h-4" />}
                              {appointment.type === 'audio' && <Phone className="w-4 h-4" />}
                              {appointment.type === 'chat' && <MessageCircle className="w-4 h-4" />}
                              {appointment.type}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                            {t.joinCall}
                          </button>
                          <button 
                            onClick={() => cancelAppointment(appointment.id)}
                            className="px-3 py-1 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            {t.cancel}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}