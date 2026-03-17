const fs = require('fs');
const file = 'c:/myProject/myProjectBest/for_me/training-platform/training-platform-frontend/src/components/layout/Header.tsx';
let txt = fs.readFileSync(file, 'utf8');
if (txt.includes('</>\\n                                                  )}')) {
    console.log('Already fixed');
    process.exit(0);
}
const matched = txt.match(/<\/Menu>([\s\S]*?)<\/Box>([\s\S]*?)<\/Box>/);
if (matched) {
    txt = txt.replace(/<\/Menu>([\s\S]*?)<\/Box>([\s\S]*?)<\/Box>/, '</Menu>$1</Box>\n                                                            </>\n                                                  )}$2</Box>');
    fs.writeFileSync(file, txt);
    console.log('Fixed Header.tsx');
} else {
    console.log('Could not find target');
}
