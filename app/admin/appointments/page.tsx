"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock4,
  Eye,
  Edit,
  Trash2,
  Plus,
  CalendarDays,
  Users,
  Building2,
  Stethoscope
} from "lucide-react";

interface Appointment {
  id: string;
  profile_id: string | null;
  facility_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  reason_for_visit: string | null;
  patient_name?: string;
  facility_name?: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    async function fetchAppointments() {
      const { data, error } = await supabase
        .from("cura_appointments")
        .select(`
          *,
          profiles:profile_id (name),
          facilities:facility_id (name)
        `)
        .order("appointment_date", { ascending: true });

      if (error) {
        console.error("Error fetching appointments:", error);
      } else {
        const enhancedData = data.map(appt => ({
          ...appt,
          patient_name: appt.profiles?.name,
          facility_name: appt.facilities?.name
        }));
        setAppointments(enhancedData);
        setFilteredAppointments(enhancedData);
      }
      setLoading(false);
    }

    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = appointments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(appt =>
        appt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.facility_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.reason_for_visit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(appt => appt.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(appt => appt.appointment_date === dateFilter);
    }

    setFilteredAppointments(filtered);
  }, [searchTerm, statusFilter, dateFilter, appointments]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-chart-1" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending':
        return <Clock4 className="w-4 h-4 text-chart-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return "bg-chart-1/10 text-chart-1";
      case 'cancelled':
        return "bg-destructive/10 text-destructive";
      case 'pending':
        return "bg-chart-3/10 text-chart-3";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground serif">Appointments</h1>
            <p className="text-muted-foreground mt-2">
              Manage and track all patient appointments
            </p>
          </div>
          <button className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-5 h-5 mr-2" />
            New Appointment
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold mt-2 text-foreground">{appointments.length}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <CalendarDays className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold mt-2 text-foreground">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </p>
              </div>
              <div className="p-3 bg-chart-1/10 rounded-lg">
                <Users className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-2 text-foreground">
                  {appointments.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-chart-3/10 rounded-lg">
                <Clock4 className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold mt-2 text-foreground">
                  {appointments.filter(a => a.status === 'cancelled').length}
                </p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by patient, facility, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-input"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card"
              />
              
              <button className="px-4 py-3 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No appointments found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search term</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-accent/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">
                              {appt.patient_name || 'Unknown Patient'}
                            </div>
                            <div className="text-sm text-muted-foreground">ID: {appt.profile_id?.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {formatDate(appt.appointment_date)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {formatTime(appt.start_time)} - {formatTime(appt.end_time)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 text-muted-foreground mr-2" />
                          <span className="text-sm text-foreground">
                            {appt.facility_name || 'Unknown Facility'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-foreground max-w-xs truncate">
                          <Stethoscope className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{appt.reason_for_visit || 'Not specified'}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(appt.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appt.status)}`}>
                            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-muted-foreground hover:text-chart-2 hover:bg-chart-2/10 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination/Info */}
        <div className="flex items-center justify-between mt-6 px-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredAppointments.length}</span> of{' '}
            <span className="font-medium text-foreground">{appointments.length}</span> appointments
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
              Previous
            </button>
            <button className="px-3 py-2 border border-primary rounded-lg text-sm bg-primary/10 text-primary font-medium">
              1
            </button>
            <button className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
              2
            </button>
            <button className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
              3
            </button>
            <button className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}