const fs = require('fs');
const file = 'c:/myProject/myProjectBest/for_me/training-platform/training-platform-frontend/src/components/layout/Header.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/<\/Menu>[\s]+<\/Box>[\s]+<\/Box>[\s]+<\/Toolbar>/, `</Menu>
                                                  </Box>
                                                            </>
                                                  )}
                                        </Box>
                              </Toolbar>`);
fs.writeFileSync(file, txt);
console.log('Fixed Header.tsx with regex!');
