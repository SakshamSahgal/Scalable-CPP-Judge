#!/bin/bash

executable_path="$1"
output_file_path="$2"
time_limit="$3"  # Time limit in seconds
max_file_size="$4"  # Max file size limit in bytes

# Execute the command with a time limit and stream its stdout into the output file
timeout "$time_limit"s sh -c "$executable_path | head -c $max_file_size > $output_file_path"

# Check the exit status of the timeout command
exit_status=$?

if [ $exit_status -eq 124 ]; then
    # Timeout occurred
    echo "tle"
    rm -f "$output_file_path"  # Remove the output file
    exit 2  # Exit code for timeout
elif [ $exit_status -ne 0 ]; then
    # Other errors occurred
    echo "Error: Execution failed with exit status $exit_status"
    rm -f "$output_file_path"  # Remove the output file
    exit 1  # Exit code for other errors
else
    # Check if output file size is exactly equal to max_file_size
    file_size=$(stat -c %s "$output_file_path")
    if [ "$file_size" -ge "$max_file_size" ]; then
        echo "mle"  # Return "mle" if file size matches max_file_size
        rm -f "$output_file_path"  # Remove the output file
        exit 3  # Exit code for file size match
    else
        echo "Execution completed successfully"
        exit 0  # Exit code for successful execution
    fi
fi