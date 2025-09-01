# Lấy tất cả các file, bỏ qua file .rar và các thư mục node_modules, uploads
$files = Get-ChildItem -Recurse -File -Exclude *.rar `
    | Where-Object {
        $_.FullName -notmatch '\\node_modules\\' -and
        $_.FullName -notmatch '\\uploads\\'
    } `
    | Select-Object -ExpandProperty FullName

# Lưu danh sách đường dẫn vào một file txt
$files | Out-File -FilePath ".\DanhSachFile.txt" -Encoding UTF8

Write-Output "Đã lưu danh sách file vào DanhSachFile.txt (đã loại trừ node_modules, uploads, và file .rar)"
