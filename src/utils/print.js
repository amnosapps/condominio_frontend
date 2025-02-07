export const printFormData = (formData) => {
    const json = {};
    for (let [key, value] of formData.entries()) {
      // If the value is a File object, include its name
      if (value instanceof File) {
        json[key] = value.name;
      } else {
        json[key] = value;
      }
    }
    console.log("FormData contents:", JSON.stringify(json, null, 2));
  };