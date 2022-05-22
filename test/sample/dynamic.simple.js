const scss = import('./simple.scss');

scss.then(style => console.log('style: %o', style));
