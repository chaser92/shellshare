var program = require('commander');

program
  .version('0.0.1')
  .option('-s, --server', 'Specify destination server')
  .parse(process.argv);

function main() {
	require('./shellshare').init();
}
main();