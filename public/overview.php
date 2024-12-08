<!DOCTYPE html>
<html>
	<head>
		<title>CC - Overview</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />

		<link rel="stylesheet" type="text/css" href="style.css" />
		<link rel="manifest" href="manifest.json" />
		<link rel="icon" href="favicon.png" />

		<script type="module" src="main.js"></script>
	</head>
	<body>
		<h1>Transaction Overview</h1>
		<table>
			<thead>
				<tr>
					<th>Date</th>
					<th>Description</th>
					<th>Amount</th>
				</tr>
			</thead>
			<?php
			$row = 1;
			if (($handle = fopen("data/transactions.csv", "r")) !== FALSE) {
					while (($data = fgetcsv($handle, 0, ";")) !== FALSE) {
							$num = count($data);
							$row++;
							echo "<tr>";
							for ($c=0; $c < $num; $c++) {
									echo "<td>" . $data[$c] . "</td>";
							}
							echo "</tr>";
					}
					fclose($handle);
			}
			?>
		</table>

		<script type="module">
		 navigator?.serviceWorker && init();

		 async function init() {
				 const registration = await navigator.serviceWorker.ready;
				 navigator.serviceWorker.addEventListener('message', receiveMessage);
				 registration.active.postMessage('get_entries');

				 function receiveMessage(event) {
						 const str = event.data;
						 const tbody = document.getElementsByTagName('tbody')[0];
						 if(str && tbody) {
								 const data = JSON.parse(str);
								 if(data?.length) {
										 data.forEach(elem => {
												 const tr = document.createElement('tr');
												 tr.classList.add('pending');
												 tr.innerHTML = `<td>${elem.date}</td><td>${elem.description}</td><td>${elem.amount}</td>`;
												 tbody.appendChild(tr);
										 });
								 }
						 }
				 }
		 }
		</script>
	</body>
</html>
