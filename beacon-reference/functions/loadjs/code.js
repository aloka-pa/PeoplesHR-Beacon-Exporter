(function(name, url) {
    return new Promise((resolve, reject) => {
      const scr = document.querySelector(`#${name}`);
      if(scr) {
        return resolve();
      }

      const script = document.createElement('script');

      script.async = true;
      script.defer = true;
      script.src = url;
      script.id = name;

      script.addEventListener('load', () => resolve('JS loaded.'));

      script.addEventListener('error', () => reject(new Error('unable to load script')));
      script.addEventListener('abort', () => reject(new Error('unable to load script')));

      document.head.appendChild(script);
  });
})