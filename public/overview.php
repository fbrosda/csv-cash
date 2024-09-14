<!DOCTYPE html>
<html>
  <head>
		<title>Transactions</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="stylesheet" type="text/css" href="style.css" />
		<link rel="icon" href="data:,">
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
					while (($data = fgetcsv($handle, 0, ",")) !== FALSE) {
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
  </body>
</html>
