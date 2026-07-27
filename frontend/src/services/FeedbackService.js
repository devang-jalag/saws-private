import api from "./api";

const FeedbackService = {
  list: () => api.get("/feedback").then((res) => res.data),
  submit: (payload) => api.post("/feedback", payload).then((res) => res.data),
};

export default FeedbackService;
