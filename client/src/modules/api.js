export const ApiMixin = {
  // API 요청 큐에 추가
  addToRequestQueue(message) {
    return new Promise((resolve, reject) => {
      this.apiRequestQueue.push({ message, resolve, reject });
      this.processQueue();
    });
  },

  // 큐 처리
  async processQueue() {
    if (this.isProcessingQueue || this.apiRequestQueue.length === 0) return;

    this.isProcessingQueue = true;
    const { message, resolve, reject } = this.apiRequestQueue.shift();

    try {
      const response = await this.makeApiRequest(message);
      resolve(response);
    } catch (error) {
      reject(error);
    } finally {
      this.isProcessingQueue = false;
      this.processQueue(); // 다음 요청 처리
    }
  },

  // 실제 API 요청
  async makeApiRequest(data) {
    console.log("API 요청 중...", data);
    try {
      const response = await fetch(`${this.serverUrl}/generate-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });
      console.log("API 응답:", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData.response;
    } catch (error) {
      console.error("Error in API request:", error);
      throw error;
    }
  },
};
