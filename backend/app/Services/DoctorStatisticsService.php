<?php

namespace App\Services;

use App\Models\Doctor;
use App\Models\Rendezvous;
use App\Models\Payment;
use App\Models\UserSubscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB; // Make sure DB facade is imported
use Illuminate\Support\Facades\Log;


class DoctorStatisticsService
{
    protected $doctor;
    protected $dbDriver;

    public function __construct(Doctor $doctor)
    {
        $this->doctor = $doctor;
        // Determine the database driver once during instantiation
        $this->dbDriver = DB::connection()->getDriverName();
    }

    /**
     * Get comprehensive statistics for the doctor's dashboard
     */
    public function getDashboardStats(): array
    {
        return [
            'overview' => $this->getOverviewStats(),
            'appointments' => $this->getAppointmentStats(),
            'patients' => $this->getPatientStats(),
            'revenue' => $this->getRevenueStats(),
            'performance' => $this->getPerformanceStats(),
            'trends' => $this->getTrendsData(),
        ];
    }

    /**
     * Get overview statistics
     */
    protected function getOverviewStats(): array
    {
        $today = Carbon::today();
        $thisMonthStart = Carbon::now()->startOfMonth();
        // $lastMonthStart = Carbon::now()->subMonthNoOverflow()->startOfMonth(); // More robust way to get last month start

        return [
            'total_patients' => $this->getTotalUniquePatients(),
            'appointments_today' => $this->doctor->appointments()
                ->whereDate('date_heure', $today)
                ->count(),
            'appointments_this_week' => $this->doctor->appointments()
                ->whereBetween('date_heure', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
                ->count(),
            'appointments_this_month' => $this->doctor->appointments()
                ->whereBetween('date_heure', [$thisMonthStart, Carbon::now()->endOfMonth()]) // Ensure full month coverage
                ->count(),
            'rating' => [
                'average' => $this->doctor->average_rating,
                'total_reviews' => $this->doctor->total_reviews,
            ],
            'subscription_status' => $this->getSubscriptionStatus(),
        ];
    }

    /**
     * Get detailed appointment statistics
     */
    protected function getAppointmentStats(): array
    {
        $appointmentsQuery = $this->doctor->appointments();
        $totalAppointments = $appointmentsQuery->count(); // Count all appointments for this doctor

        $appointmentsByStatus = $this->doctor->appointments() // Re-query for by_status to avoid modifying the total count query
            ->selectRaw('statut, COUNT(*) as count')
            ->groupBy('statut')
            ->pluck('count', 'statut')
            ->toArray();


        return [
            'total' => $totalAppointments,
            'by_status' => [
                'confirmé' => $appointmentsByStatus['confirmé'] ?? 0,
                'pending' => $appointmentsByStatus['en_attente'] ?? 0,
                'completed' => $appointmentsByStatus['terminé'] ?? 0,
                'cancelled' => $appointmentsByStatus['annulé'] ?? 0,
                'no_show' => $appointmentsByStatus['no_show'] ?? 0,
            ],
            'rates' => [
                'completion_rate' => $totalAppointments > 0
                    ? round((($appointmentsByStatus['terminé'] ?? 0) / $totalAppointments) * 100, 2)
                    : 0,
                'no_show_rate' => $totalAppointments > 0
                    ? round((($appointmentsByStatus['no_show'] ?? 0) / $totalAppointments) * 100, 2)
                    : 0,
                'cancellation_rate' => $totalAppointments > 0
                    ? round((($appointmentsByStatus['annulé'] ?? 0) / $totalAppointments) * 100, 2)
                    : 0,
            ],
            'average_per_day' => $this->getAverageAppointmentsPerDay(),
            'peak_hours' => $this->getPeakAppointmentHours(),
        ];
    }

    /**
     * Get patient statistics
     */
    protected function getPatientStats(): array
    {
        $newPatientsThisMonth = $this->doctor->appointments()
            ->selectRaw('patient_id, MIN(created_at) as first_appointment_date') // Use a different alias
            ->groupBy('patient_id')
            ->havingRaw('MIN(created_at) >= ?', [Carbon::now()->startOfMonth()])
            ->get()->count(); // Use get()->count() to count the resulting collection

        $returningPatients = $this->doctor->appointments()
            ->selectRaw('patient_id, COUNT(*) as appointment_count')
            ->groupBy('patient_id')
            ->havingRaw('COUNT(*) > 1')
            ->get()->count(); // Use get()->count()

        $totalUniquePatients = $this->getTotalUniquePatients();

        return [
            'total_unique' => $totalUniquePatients,
            'new_this_month' => $newPatientsThisMonth,
            'returning' => $returningPatients,
            'retention_rate' => $totalUniquePatients > 0
                ? round(($returningPatients / $totalUniquePatients) * 100, 2)
                : 0,
            'demographics' => $this->getPatientDemographics(),
        ];
    }

    /**
     * Get revenue statistics
     */
    protected function getRevenueStats(): array
    {
        $currentYear = Carbon::now()->year;
        $lastYear = Carbon::now()->subYear()->year;

        $yearExtraction = $this->dbDriver === 'sqlite' ? "strftime('%Y', created_at)" : "YEAR(created_at)";
        $monthExtraction = $this->dbDriver === 'sqlite' ? "strftime('%m', created_at)" : "MONTH(created_at)";

        $currentYearRevenue = Payment::where('user_id', $this->doctor->user_id)
            ->where('status', 'completed')
            ->whereRaw("{$yearExtraction} = ?", [$currentYear])
            ->sum('amount');

        $lastYearRevenue = Payment::where('user_id', $this->doctor->user_id)
            ->where('status', 'completed')
            ->whereRaw("{$yearExtraction} = ?", [$lastYear])
            ->sum('amount');

        $monthlyRevenueData = Payment::where('user_id', $this->doctor->user_id)
            ->where('status', 'completed')
            ->whereRaw("{$yearExtraction} = ?", [$currentYear])
            ->selectRaw("CAST({$monthExtraction} AS INTEGER) as month, SUM(amount) as total")
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        return [
            'total_this_year' => $currentYearRevenue,
            'total_last_year' => $lastYearRevenue,
            'growth_percentage' => $lastYearRevenue > 0
                ? round((($currentYearRevenue - $lastYearRevenue) / $lastYearRevenue) * 100, 2)
                : ($currentYearRevenue > 0 ? 100 : 0),
            'monthly_breakdown' => $this->formatMonthlyRevenue($monthlyRevenueData),
            'average_monthly' => count($monthlyRevenueData) > 0
                ? round(array_sum($monthlyRevenueData) / count($monthlyRevenueData), 2)
                : 0,
        ];
    }


    /**
     * Get performance metrics
     */
    protected function getPerformanceStats(): array
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $completedAppointments = $this->doctor->appointments()
            ->where('statut', 'terminé')
            ->where('date_heure', '>=', $thirtyDaysAgo)
            ->count();

        $recentReviews = $this->doctor->approvedReviews() // Assuming approvedReviews is a scope or relationship
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as count')
            ->first();

        return [
            'consultations_last_30_days' => $completedAppointments,
            'patient_satisfaction' => [
                'average_rating' => round($recentReviews->avg_rating ?? 0, 2),
                'total_reviews' => $recentReviews->count ?? 0,
            ],
            'response_time' => $this->getAverageResponseTime(),
            'availability_score' => $this->calculateAvailabilityScore(),
        ];
    }

    /**
     * Get trends data for charts
     */
    protected function getTrendsData(): array
    {
        $sixMonthsAgo = Carbon::now()->subMonths(6)->startOfMonth();
        $dateFormat = $this->dbDriver === 'sqlite' ? "strftime('%Y-%m', date_heure)" : "DATE_FORMAT(date_heure, '%Y-%m')";

        $appointmentsTrend = $this->doctor->appointments()
            ->where('date_heure', '>=', $sixMonthsAgo)
            ->selectRaw("{$dateFormat} as month_year, COUNT(*) as count") // Use month_year to avoid conflict with month keyword
            ->groupBy('month_year')
            ->orderBy('month_year')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $item->month_year)->format('M Y'),
                    'count' => $item->count,
                ];
            });

        $noShowTrendData = $this->doctor->appointments()
            ->where('date_heure', '>=', $sixMonthsAgo)
            ->where('statut', 'no_show')
            ->selectRaw("{$dateFormat} as month_year, COUNT(*) as count")
            ->groupBy('month_year')
            ->orderBy('month_year')
            ->pluck('count', 'month_year')
            ->toArray();
        $noShowTrend = $this->formatNoShowTrend($noShowTrendData);


        $patientGrowth = $this->doctor->appointments()
            ->where('date_heure', '>=', $sixMonthsAgo)
            ->selectRaw("{$dateFormat} as month_year, COUNT(DISTINCT patient_id) as unique_patients")
            ->groupBy('month_year')
            ->orderBy('month_year')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $item->month_year)->format('M Y'),
                    'patients' => $item->unique_patients,
                ];
            });

        return [
            'appointments' => $appointmentsTrend,
            'no_shows' => $noShowTrend,
            'patient_growth' => $patientGrowth,
        ];
    }


    /**
     * Get total unique patients
     */
    protected function getTotalUniquePatients(): int
    {
        return $this->doctor->appointments()
            ->distinct('patient_id')
            ->count('patient_id');
    }

    /**
     * Get average appointments per day
     */
    protected function getAverageAppointmentsPerDay(): float
    {
        $firstAppointment = $this->doctor->appointments()->min('date_heure');

        if (!$firstAppointment) {
            return 0;
        }

        $daysSinceFirst = Carbon::parse($firstAppointment)->diffInDays(now());
        $totalAppointments = $this->doctor->appointments()->count();

        return $daysSinceFirst > 0 ? round($totalAppointments / $daysSinceFirst, 2) : 0;
    }

    /**
     * Get peak appointment hours
     */
    protected function getPeakAppointmentHours(): array
    {
        $query = $this->doctor->appointments();

        if ($this->dbDriver === 'sqlite') {
            $query->selectRaw("strftime('%H', date_heure) as appointment_hour, COUNT(*) as count");
        } else {
            $query->selectRaw('HOUR(date_heure) as appointment_hour, COUNT(*) as count');
        }

        return $query->groupBy('appointment_hour') // Use a different alias if 'hour' is a reserved keyword
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => sprintf('%02d:00', $item->appointment_hour),
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Get patient demographics
     */
    protected function getPatientDemographics(): array
    {
        $ageCalculationSelect = '';

        if ($this->dbDriver === 'sqlite') {
            // For SQLite: Calculate age using strftime
            // This calculates age based on year difference, then adjusts if birthday hasn't occurred yet this year.
            $ageCalculationSelect = "AVG(
                CAST(strftime('%Y', 'now') AS INTEGER) - CAST(strftime('%Y', users.date_de_naissance) AS INTEGER) -
                (CASE WHEN strftime('%m-%d', 'now') < strftime('%m-%d', users.date_de_naissance) THEN 1 ELSE 0 END)
            ) as avg_age";
        } else {
            // For MySQL: Use TIMESTAMPDIFF
            $ageCalculationSelect = "AVG(TIMESTAMPDIFF(YEAR, users.date_de_naissance, CURDATE())) as avg_age";
        }

        $demographics = DB::table('rendezvous')
            ->join('users', 'rendezvous.patient_id', '=', 'users.id')
            // ->join('patients', 'users.id', '=', 'patients.user_id') // Assuming patient_id in rendezvous is user_id
            ->where('rendezvous.doctor_id', $this->doctor->id)
            ->whereNotNull('users.date_de_naissance') // Ensure date_de_naissance is not null for age calculation
            ->selectRaw("
                COUNT(DISTINCT users.id) as total,
                SUM(CASE WHEN users.sexe = 'homme' THEN 1 ELSE 0 END) as male,
                SUM(CASE WHEN users.sexe = 'femme' THEN 1 ELSE 0 END) as female,
                {$ageCalculationSelect}
            ")
            ->first();

        return [
            'total' => $demographics->total ?? 0,
            'by_gender' => [
                'male' => $demographics->male ?? 0,
                'female' => $demographics->female ?? 0,
            ],
            'average_age' => round($demographics->avg_age ?? 0),
        ];
    }


    /**
     * Get subscription status
     */
    protected function getSubscriptionStatus(): array
    {
        $activeSubscription = UserSubscription::where('user_id', $this->doctor->user_id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->with('subscriptionPlan')
            ->first();

        if (!$activeSubscription) {
            return [
                'active' => false,
                'plan' => null,
                'expires_at' => null,
                'days_remaining' => 0,
            ];
        }

        return [
            'active' => true,
            'plan' => $activeSubscription->subscriptionPlan->name ?? 'Unknown',
            'expires_at' => $activeSubscription->ends_at->format('Y-m-d'),
            'days_remaining' => $activeSubscription->getRemainingDays(),
        ];
    }

    /**
     * Calculate average response time (placeholder)
     */
    protected function getAverageResponseTime(): string
    {
        return '< 2 hours'; // Placeholder
    }

    /**
     * Calculate availability score
     */
    protected function calculateAvailabilityScore(): int
    {
        // Example: 8 hours/day * 5 days (can be made more dynamic based on actual schedule)
        $scheduledWeeklyHours = 0;
        if (is_array($this->doctor->horaires)) {
            foreach ($this->doctor->horaires as $daySchedule) {
                if (is_array($daySchedule)) {
                    foreach ($daySchedule as $timeRange) {
                        if (is_string($timeRange) && strpos($timeRange, '-') !== false) {
                             try {
                                [$start, $end] = explode('-', $timeRange);
                                $startTime = Carbon::parse($start);
                                $endTime = Carbon::parse($end);
                                $scheduledWeeklyHours += $endTime->diffInHours($startTime);
                            } catch (\Exception $e) {
                                Log::warning("Could not parse time range for availability score: " . $timeRange);
                            }
                        }
                    }
                }
            }
        }
        $totalSlotsApproximation = $scheduledWeeklyHours * 2; // Assuming 30 min slots

        $bookedSlotsThisWeek = $this->doctor->appointments()
            ->whereBetween('date_heure', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->whereNotIn('statut', ['annulé', 'no_show'])
            ->count();

        $utilizationRate = $totalSlotsApproximation > 0 ? ($bookedSlotsThisWeek / $totalSlotsApproximation) * 100 : 0;

        if ($utilizationRate < 30) return 60;
        if ($utilizationRate > 90) return 70;
        return min(100, intval(70 + ($utilizationRate - 30) * 0.5));
    }

    /**
     * Format monthly revenue data
     */
    protected function formatMonthlyRevenue(array $monthlyRevenueData): array
    {
        $formatted = [];
        for ($month = 1; $month <= 12; $month++) {
            $formatted[] = [
                'month' => Carbon::create(null, $month)->format('M'),
                'revenue' => $monthlyRevenueData[$month] ?? 0,
            ];
        }
        return $formatted;
    }

    /**
     * Format no-show trend data
     */
    protected function formatNoShowTrend(array $noShowData): array
    {
        $formatted = [];
        // Ensure months are in order and fill missing ones with 0
        $currentMonth = Carbon::now()->subMonths(5)->startOfMonth(); // Start 6 months ago including current
        for ($i = 0; $i < 6; $i++) {
            $monthKey = $currentMonth->format('Y-m');
            $formatted[] = [
                'month' => $currentMonth->format('M Y'),
                'count' => $noShowData[$monthKey] ?? 0,
            ];
            $currentMonth->addMonth();
        }
        return $formatted;
    }
}
