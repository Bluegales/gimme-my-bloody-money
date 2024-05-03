def split_hex_into_chunks(hex_string, num_chunks=8):
    # Remove the '0x' prefix if present
    if hex_string.startswith('0x'):
        hex_string = hex_string[2:]
    
    # Calculate the total length of the hex digits and chunk size
    total_length = len(hex_string)
    chunk_size = total_length // num_chunks

    # Ensure the chunk size is an even number (since each hex digit represents 4 bits)
    if chunk_size % 2 != 0:
        chunk_size += 1
    
    # Create a list to hold each chunk
    chunks = []

    # Slice the hex string into chunks
    for i in range(num_chunks):
        start_index = i * chunk_size
        # Make sure not to go out of range on the last chunk
        if i == num_chunks - 1:
            end_index = None
        else:
            end_index = start_index + chunk_size
        chunk = '0x' + hex_string[start_index:end_index]
        chunks.append(chunk)

    return chunks

# Your large hex string
large_hex_string = "0x29939fcebaadd3aae4e5400e5a4bf927331de3fbd7761df74b1759486d7e638c28d56a3cf3660b55032bd1b724737f67721148474eb7b0b37ecf70797caffc1814f5547cb7366aa04bbbd416d92b74f343838efbd4153384c864a9672bdbd0b619251475cf9b5dfd8342ff14a700255aaa42303ab6f27c7e17ad116f628b68632def2222be6805d3058ba139996179b397b3317e1ba6d046b1ad46db1c8628cf2045124cf6cd7bedbe2f5666d91370060baa69ceae4f5ed733fe65b9700daf62240257251f5d4ec5757057a3a9bf6562dd09af9a0f08804a8cbe1266a6b76925262603158aaf68e53c0ed16cb427e1a91f1675f479d30ea128be84ebeae333eb"
arr = split_hex_into_chunks(large_hex_string)
for i, a in enumerate(arr):
    print(f"proof[{i}] =", a, ";")
