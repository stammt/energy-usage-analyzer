"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UtilityType, EnergyUsageRecord } from '@/types/energy';
import { Upload, AlertCircle, CheckCircle, Zap, Flame } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FileUploaderProps {
    onDataLoaded: (data: EnergyUsageRecord[], type: UtilityType) => void;
    forcedType?: UtilityType; // Optional: If set, enforces this type and styles the box accordingly
}

export function FileUploader({ onDataLoaded, forcedType }: FileUploaderProps) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        setSuccess(null);
        const file = acceptedFiles[0];
        if (!file) return;

        setFileName(file.name);
        parseFile(file);
    }, [onDataLoaded, forcedType]);

    const parseFile = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const { data, type } = normalizeData(results.data);

                    // Verify type match if forcedType is present
                    if (forcedType && type !== forcedType) {
                        // Optional: warn the user? Or just override? 
                        // Let's suspect our heuristic might be wrong if the user explicitly dropped it in the "Gas" box.
                        // But if the file clearly has "kwh" headers, we should probably throw an error.
                        if (type === 'electric' && forcedType === 'gas') {
                            throw new Error("This looks like an Electric file (found kWh), but you uploaded it to the Gas slot.");
                        }
                        if (type === 'gas' && forcedType === 'electric') {
                            throw new Error("This looks like a Gas file (found Therms/CCF), but you uploaded it to the Electric slot.");
                        }
                    }

                    onDataLoaded(data, forcedType || type);
                    setSuccess(`Loaded ${data.length} records.`);
                } catch (e) {
                    setError((e as Error).message);
                    setSuccess(null);
                }
            },
            error: (err) => {
                setError(`CSV Parse Error: ${err.message}`);
            }
        });
    };

    const normalizeData = (rows: any[]): { data: EnergyUsageRecord[], type: UtilityType } => {
        if (rows.length === 0) throw new Error("File is empty");

        const firstRow = rows[0];
        const keys = Object.keys(firstRow).map(k => k.toLowerCase());

        // Heuristics
        let type: UtilityType = 'electric';
        const isGas = keys.some(k => k.includes('therm') || k.includes('ccf') || k.includes('gas'));
        if (isGas) type = 'gas';

        // Find date column
        const dateKey = Object.keys(firstRow).find(k =>
            k.toLowerCase() === 'date' || k.toLowerCase().includes('bill start') || k.toLowerCase().includes('reading date')
        );

        // Find start time column
        const timeKey = Object.keys(firstRow).find(k =>
            k.toLowerCase() === 'start time' || k.toLowerCase().includes('start time')
        );

        // Find usage column
        const usageKey = Object.keys(firstRow).find(k =>
            k.toLowerCase().includes('usage') || k.toLowerCase().includes('kwh') || k.toLowerCase().includes('consumption') || (type === 'gas' && k.toLowerCase().includes('therm'))
        );

        if (!dateKey || !usageKey) {
            // If forcedType is set, try harder to find *any* numeric column? 
            // For now, strict validation is safer.
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

            if (isNaN(val) || isNaN(date.getTime())) return null;

            return {
                date,
                usage: val,
                estimated: false
            };
        }).filter((r): r is EnergyUsageRecord => r !== null);

        return { data, type };
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        maxFiles: 1
    });

    const title = forcedType ? `${forcedType === 'electric' ? 'Electric' : 'Gas'} Data` : 'Usage Data';
    const Icon = forcedType === 'gas' ? Flame : Zap; // Default to Zap if unsure or electric

    return (
        <Card className={`w-full ${forcedType === 'electric' ? 'border-blue-200 dark:border-blue-900' : forcedType === 'gas' ? 'border-orange-200 dark:border-orange-900' : ''}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {forcedType && <Icon className={`h-5 w-5 ${forcedType === 'electric' ? 'text-blue-500' : 'text-orange-500'}`} />}
                    {title}
                </CardTitle>
                <CardDescription>
                    {fileName ? (
                        <span className="font-mono text-xs truncate block max-w-[200px]">{fileName}</span>
                    ) : (
                        "Drag and drop CSV"
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    {...getRootProps()}
                    className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${success ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : ''}
          `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                        {success ? (
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : (
                            <Upload className="h-8 w-8 text-muted-foreground" />
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
            </CardContent>
        </Card>
    );
}
