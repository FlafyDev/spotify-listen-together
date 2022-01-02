yarn run build &&
node dist/src/pushExtension &&
for url in $(cat debuggerUrls.txt); do 
  wscat --connect ${url} --execute '{"id":1,"method":"Page.reload"}'; 
done