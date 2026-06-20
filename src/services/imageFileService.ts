function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string" && reader.result.length > 0) {
        resolve(reader.result);
        return;
      }

      reject(new Error(`Unable to process image: ${file.name}`));
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
}

export async function convertFilesToDataUrls(files: File[]) {
  const imageFiles = files.filter((file) => file.type.startsWith("image/"));
  const urls = await Promise.all(imageFiles.map((file) => readFileAsDataUrl(file)));
  return urls.filter((url) => url.length > 0);
}