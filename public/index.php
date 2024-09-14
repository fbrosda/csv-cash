<!DOCTYPE html>
<?php
$today = date("Y-m-d");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
		if (($handle = fopen("data/transactions.csv", "a")) !== FALSE) {
				fputcsv($handle, array($_POST["date"], $_POST["description"], $_POST["amount"]));
				fclose($handle);
		}
}

function getAutocompleteValues($start) {
		$values = array();
		if (($handle = fopen("data/transactions.csv", "r")) !== FALSE) {
				while (($data = fgetcsv($handle, 0, ",")) !== FALSE) {
						$num = count($data);
						for ($c=$start; $c < $num; $c += 3) {
								$values[] = $data[$c];
						}
				}
				fclose($handle);
		}

		foreach (array_unique($values) as $val) {
				echo "<option>" . $val . "</option>";
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
			<input id="description" name="description" type="text" list="description-list" required/>

			<label for="amount">Amount</label>
			<input id="amount" name="amount" type="number" min="0" step="0.01" list="amount-list" required/>
			
			<button>Save</button>

			<datalist id="description-list">
				<?php getAutocompleteValues(1) ?>
			</datalist>

			<datalist id="amount-list">
				<?php getAutocompleteValues(2) ?>
			</datalist>
		</form>

		<div style="margin-top: 20px; text-align: right;">
			see <a href="overview.php">Overview</a>
		</div>
  </body>
</html>
