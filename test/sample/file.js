import scss from 'file:./simple.scss';

fetch(scss).then(s => console.log('source: %s', s));
