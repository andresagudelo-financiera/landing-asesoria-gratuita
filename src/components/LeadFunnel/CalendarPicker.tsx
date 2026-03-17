import React, { useState, useEffect } from 'react';

interface CalendarPickerProps {
    onSchedule: (date: string, time: string, coachEmail: string) => void;
    onBack: () => void;
    apiUrl?: string; // Endpoint opcional para pruebas
}

// Interfaz temporal para mockear los datos
interface TimeSlot {
    time: string; // ej. "09:00"
    available: boolean;
    coach?: string; // Email del coach
}

interface DayAvailability {
    date: string; // ISO yyyy-mm-dd
    slots: TimeSlot[];
}

export default function CalendarPicker({ onSchedule, onBack, apiUrl }: CalendarPickerProps) {
    const [availableDays, setAvailableDays] = useState<DayAvailability[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [assignedCoach, setAssignedCoach] = useState<{ name: string, email: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const baseUrl = apiUrl || '/api/calendar/availability';
                const separator = baseUrl.includes('?') ? '&' : '?';
                const res = await fetch(`${baseUrl}${separator}t=${Date.now()}`, {
                    cache: 'no-store'
                });
                const data = await res.json();

                if (data.success && data.availability) {
                    // Set assigned coach for UI display (first available)
                    if (data.coaches && data.coaches.length > 0) {
                        setAssignedCoach(data.coaches[0]);
                    }

                     // Convert object mapping to DayAvailability[] array
                    const daysMapped: DayAvailability[] = Object.keys(data.availability).map(dateStr => ({
                        date: dateStr,
                        slots: data.availability[dateStr].map((item: any) => ({
                            time: item.time,
                            available: true,
                            coach: item.coach
                        }))
                    }));
                    setAvailableDays(daysMapped);
                } else {
                    console.error("Availability error:", data.error);
                }
            } catch (err) {
                console.error("Failed to fetch calendar", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvailability();
    }, []);

    const currentSlots = selectedDate ? availableDays.find(d => d.date === selectedDate)?.slots : [];

    const handleConfirm = (e?: React.MouseEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        
        if (selectedDate && selectedTime) {
            const currentSlots = availableDays.find(d => d.date === selectedDate)?.slots || [];
            const slot = currentSlots.find(s => s.time === selectedTime);
            
            if (slot && slot.coach) {
                onSchedule(selectedDate, selectedTime, slot.coach);
            } else {
                console.error("No coach found for slot");
                // Fallback o manejo de error opcional
            }
            setIsSubmitting(true);
        }
    };


    const formatDateLabel = (isoDate: string) => {
        const d = new Date(isoDate);
        // Para no lidiar con timezone offsets en el mock, añadimos un fix rápido
        const adjustedDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
        return adjustedDate.toLocaleDateString('es-CO', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex flex-col h-full !font-sans animate-in fade-in duration-500 w-full max-w-2xl mx-auto">

            <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Selecciona tu Sesión</h3>
                <p className="text-white/60 mb-6">Elige el día y la hora que mejor se adapte a ti.</p>

                {assignedCoach && (
                    <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-full pr-6 pl-2 py-2 shadow-lg mb-4 animate-in slide-in-from-bottom-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-claudia-accent-green bg-claudia-dark/50 flex-shrink-0">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(assignedCoach.name.replace('.', ' '))}&background=C6FF00&color=051c2c&size=128&bold=true`}
                                alt={assignedCoach.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-left flex flex-col justify-center">
                            <span className="text-xs text-claudia-accent-green uppercase tracking-wide font-bold">Tu Coach Asignado</span>
                            <span className="text-white font-medium capitalize text-sm">{assignedCoach.name.toLowerCase().replace('.', ' ')}</span>
                        </div>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-claudia-accent-green rounded-full animate-spin"></div>
                    <p className="mt-4 text-white/50 animate-pulse">Sincronizando calendarios...</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col md:flex-row gap-8">

                    {/* Columna: Días */}
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Fechas Disponibles</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {availableDays.map(day => {
                                const hasSlots = day.slots && day.slots.length > 0;
                                return (
                                    <button
                                        key={day.date}
                                        type="button"
                                        disabled={!hasSlots}
                                        onClick={() => {
                                            setSelectedDate(day.date);
                                            setSelectedTime(null);
                                        }}
                                        className={`py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                                            !hasSlots
                                                ? 'opacity-40 cursor-not-allowed border-transparent bg-white/5 text-white/30'
                                                : selectedDate === day.date
                                                    ? 'border-claudia-accent-green bg-claudia-accent-green/10 text-claudia-accent-green shadow-[0_0_15px_rgba(198,255,0,0.2)]'
                                                    : 'border-white/10 bg-white/5 text-white hover:border-white/30 hover:bg-white/10'
                                        }`}
                                    >
                                        <span className="capitalize font-medium text-lg">{formatDateLabel(day.date).split(',')[0]}</span>
                                        <span className="text-xs opacity-70 mt-1">{formatDateLabel(day.date).split(',')[1]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Columna: Horas */}
                    <div className="flex-[0.8] border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                        <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">
                            {selectedDate ? 'Horas' : 'Selecciona un día'}
                        </h4>

                        {!selectedDate ? (
                            <div className="h-full flex items-center justify-center opacity-30 text-center pb-20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p>Elige una fecha<br />a la izquierda</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {currentSlots?.length === 0 ? (
                                    <p className="col-span-2 text-white/50 text-center py-4">Sin horas disponibles</p>
                                ) : (
                                    currentSlots?.map(slot => (
                                        <button
                                            key={slot.time}
                                            type="button"
                                            disabled={!slot.available}
                                            onClick={() => setSelectedTime(slot.time)}
                                            className={`py-2 px-4 rounded-lg border-2 transition-all ${!slot.available
                                                ? 'opacity-30 cursor-not-allowed border-transparent bg-white/5 text-white line-through decoration-red-500/50'
                                                : selectedTime === slot.time
                                                    ? 'border-claudia-accent-green bg-claudia-accent-green text-claudia-dark font-bold shadow-[0_0_10px_rgba(198,255,0,0.5)]'
                                                    : 'border-white/10 bg-white/5 text-white hover:border-white/30 hover:bg-white/10'
                                                }`}
                                        >
                                            {slot.time}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Navegación */}
            <div className="mt-8 flex items-center justify-end border-t border-white/10 pt-6">

                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!selectedDate || !selectedTime || isSubmitting}
                    className="relative px-8 py-3 bg-claudia-accent-green text-claudia-dark rounded-full font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-claudia-dark border-t-transparent rounded-full animate-spin"></div>
                            Agendando...
                        </span>
                    ) : (
                        'Confirmar Cita'
                    )}
                </button>
            </div>

        </div>
    );
}
