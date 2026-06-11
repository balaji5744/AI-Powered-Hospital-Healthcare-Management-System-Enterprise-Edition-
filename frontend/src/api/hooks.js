import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios"; // Assuming this is where your interceptor is

// --- FETCHING DATA (GET) ---

export const useMyAppointments = () => {
  return useQuery({
    queryKey: ["appointments", "me"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/appointments/me");
      return data.data || data; // Adjust based on your FastAPI response shape
    },
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/departments/");
      return data.data;
    },
  });
};

// --- MUTATIONS (POST/PATCH - for Buttons!) ---

export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appointmentData) => {
      const { data } = await axiosInstance.post(
        "/appointments/",
        appointmentData,
      );
      return data;
    },
    onSuccess: () => {
      // This forces the dashboard to instantly refresh and show the new appointment!
      queryClient.invalidateQueries(["appointments", "me"]);
      alert("Appointment booked successfully!");
    },
    onError: (error) => {
      alert(error.response?.data?.detail || "Failed to book slot.");
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      // This calls the /admin/stats endpoint we built on Backend Day 1
      const { data } = await axiosInstance.get("/admin/stats");
      return data.data;
    },
  });
};

export const useAvailableSlots = (doctorId, date) => {
  return useQuery({
    queryKey: ["slots", doctorId, date],
    queryFn: async () => {
      // Calls the slot generation engine we built on Backend Day 2
      const { data } = await axiosInstance.get(
        `/appointments/doctors/${doctorId}/slots?date_str=${date}`,
      );
      return data.available_slots;
    },
    // Only run this fetch if the user has actually selected a doctor and a date!
    enabled: !!doctorId && !!date,
  });
};
