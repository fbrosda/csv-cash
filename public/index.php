<!DOCTYPE html>
<?php
$today = date("Y-m-d");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
		if (($handle = fopen("data/transactions.csv", "a")) !== FALSE) {
				fputcsv($handle, array($_POST["date"], $_POST["description"], $_POST["amount"]));
				fclose($handle);
		}
}
?>
<html>
  <head>
		<title>Create New Record</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="stylesheet" type="text/css" href="style.css" />
		<link rel="icon" href="data:,">
  </head>
  <body>
		<h1>Create new Record</h1>
		<form method="POST">
			<label for="date">Date</label>
			<input id="date" name="date" type="date"
						 value="<?php echo $today?>" max="<?php echo $today?>" required />

			<label for="description">Description</label>
			<input id="description" name="description" type="text" required/>

			<label for="amount">Amount</label>
			<input id="amount" name="amount" type="number" min="0" step="0.01" required/>
			
			<button>Save</button>
		</form>
  </body>
</html>
