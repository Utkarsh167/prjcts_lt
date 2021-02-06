<!DOCTYPE html>
<html>
<body>

<form action="upload_pic.php" method="post" enctype="multipart/form-data">
    <label>consignment_no</label>

    <input type="text" name="consignment_no">

    <label>user name</label>
    <input type="text" name="user_name">

    Select image to upload:
    <input type="file" name="fileToUpload" id="fileToUpload">
    <input type="submit" value="Upload Image" name="submit">
</form>

</body>
</html> 