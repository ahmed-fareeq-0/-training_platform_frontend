const fs = require('fs');
const file = 'c:/myProject/myProjectBest/for_me/training-platform/training-platform-frontend/src/components/layout/Header.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(
    "{ key: 'courses', labelKey: 'nav.courses', path: '/courses' },",
    "{ key: 'home', labelKey: 'nav.home', path: '/' },\n                              { key: 'courses', labelKey: 'nav.courses', path: '/courses' },"
);

fs.writeFileSync(file, txt);
console.log('Successfully injected home link');
