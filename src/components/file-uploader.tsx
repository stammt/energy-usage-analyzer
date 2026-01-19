"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone'; // I need to install this!
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UtilityType, EnergyUsageRecord } from '@/types/energy';


interface FileUploaderProps {
    onDataLoaded: (data: EnergyUsageRecord[], type: UtilityType) => void;
}

export function FileUploader({ onDataLoaded }: FileUploaderProps) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        setSuccess(null);
        const file = acceptedFiles[0];
        if (!file) return;

        // Simple heuristic: check filename or ask user? 
        // For MVP, let's look for keywords in filename or defaulting to electric if unsure, 
        // but ideally we parse the header.
        // Let's defer type detection to the parsing logic or add a selector.
        // For now, I'll parse and try to detect.

        parseFile(file);
    }, [onDataLoaded]); // Added onDataLoaded to dependency array

    const parseFile = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const { data, type } = normalizeData(results.data);
                    onDataLoaded(data, type);
                    setSuccess(`Successfully loaded ${data.length} records for ${type}.`);
                } catch (e) {
                    setError((e as Error).message);
                }
            },
            error: (err) => {
                setError(`CSV Parse Error: ${err.message}`);
            }
        });
    };

    const normalizeData = (rows: any[]): { data: EnergyUsageRecord[], type: UtilityType } => {
        if (rows.length === 0) throw new Error("File is empty");

        // Detect columns
        const firstRow = rows[0];
        const keys = Object.keys(firstRow).map(k => k.toLowerCase());

        // Heuristics for Gas vs Electric
        // Gas often has "Therms", "CCF"
        // Electric has "kWh", "Kilowatt Hours"

        let type: UtilityType = 'electric';
        const isGas = keys.some(k => k.includes('therm') || k.includes('ccf') || k.includes('gas'));
        if (isGas) type = 'gas';

        // Find date column
        const dateKey = Object.keys(firstRow).find(k =>
            k.toLowerCase() === 'date' || k.toLowerCase().includes('bill start') || k.toLowerCase().includes('reading date')
        );

        // Find start time column (for hourly data)
        const timeKey = Object.keys(firstRow).find(k =>
            k.toLowerCase() === 'start time' || k.toLowerCase().includes('start time')
        );

        // Find usage column
        const usageKey = Object.keys(firstRow).find(k =>
            k.toLowerCase().includes('usage') || k.toLowerCase().includes('kwh') || k.toLowerCase().includes('consumption') || (type === 'gas' && k.toLowerCase().includes('therm'))
        );

        if (!dateKey || !usageKey) {
            throw new Error(`Could not identify Date or Usage columns. Found: ${Object.keys(firstRow).join(', ')}`);
        }

        const data: EnergyUsageRecord[] = rows.map((row: any) => {
            const valStr = row[usageKey];
            if (!valStr) return null;

            const val = parseFloat(valStr.toString().replace(/[^0-9.-]/g, ''));

            let dateStr = row[dateKey];
            if (timeKey && row[timeKey]) {
                dateStr += ` ${row[timeKey]}`;
            }

            const date = new Date(dateStr);

            if (isNaN(val) || isNaN(date.getTime())) {
                return null; // Skip invalid rows
            }

            return {
                date: date,
                usage: val,
                estimated: false // default
            };
        }).filter((r): r is EnergyUsageRecord => r !== null);

        return { data, type };
    };

    // Temporarily define useDropzone locally since I haven't installed it yet
    // actually wait, I must install it. I'll do that in the next tool call.
    // For now I'm writing the code assuming it exists.
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        maxFiles: 1
    });

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Upload Usage Data</CardTitle>
                <CardDescription>Drag and drop your utility CSV file here</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    {...getRootProps()}
                    className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}
          `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        {isDragActive ? (
                            <p className="text-sm font-medium">Drop the file here...</p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Drag & drop or click to select
                            </p>
                        )}
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mt-4 border-green-500 text-green-700 bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
