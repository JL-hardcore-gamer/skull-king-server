const prettyPrintObj = (obj: any) => {
  const allKeys = Object.keys(obj);

  allKeys.forEach((key) => {
    console.log(`Key ${key}:`, obj[key]);
  });
};

const shuffleArray = <T>(a: Array<T>): Array<T> => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export { prettyPrintObj, shuffleArray };
