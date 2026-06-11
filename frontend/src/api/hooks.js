import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";

// ==========================================
// 1. ADMIN HOOKS
// ==========================================
export const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
  });
};

// ==========================================
// 2. PATIENT APPOINTMENT HOOKS
// ==========================================
export const useMyAppointments = () => {
  return useQuery({
    queryKey: ["myAppointments"],
    queryFn: async () => {
      const { data } = await api.get("/appointments/me");
      return data;
    },
  });
};

export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appointmentData) => {
      const { data } = await api.post("/appointments/", appointmentData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
    },
  });
};

// ==========================================
// 3. DOCTOR HOOKS (DYNAMIC FETCHING)
// ==========================================
export const useDoctorsByDepartment = (department) => {
  return useQuery({
    queryKey: ["doctors", department],
    queryFn: async () => {
      if (!department) return [];
      const { data } = await api.get(
        `/doctors?department=${encodeURIComponent(department)}`,
      );
      return data;
    },
    enabled: !!department,
  });
};

// ==========================================
// 4. AUTH / SIGNUP HOOKS
// ==========================================
export const useSignupPatient = () => {
  return useMutation({
    mutationFn: async (patientData) => {
      const { data } = await api.post("/auth/register", patientData);
      return data;
    },
  });
};

// ==========================================
// 5. PATIENT PROFILE HOOKS
// ==========================================
export const usePatientProfile = () => {
  return useQuery({
    queryKey: ["patientProfile"],
    queryFn: async () => {
      const { data } = await api.get("/patients/me");
      return data;
    },
  });
};

export const useUpdatePatientProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedData) => {
      const { data } = await api.put("/patients/me", updatedData);
      return data;
    },
    onSuccess: () => {
      // Instantly alerts the client UI layer to repaint with clean database entries
      queryClient.invalidateQueries({ queryKey: ["patientProfile"] });
    },
  });
};
