import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer';
import type { GuideDocument } from '@/types';
import { downloadBlob, slugify } from '@/utils/helpers';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#171717',
    lineHeight: 1.4,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 11,
    color: '#5c5c5c',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#0f766e',
  },
  eventTitle: {
    fontSize: 14,
    marginTop: 14,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  label: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  block: {
    marginBottom: 8,
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 8,
    backgroundColor: '#f4f4f1',
    padding: 8,
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginTop: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e0',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  colIndex: { width: '8%' },
  colName: { width: '32%' },
  colType: { width: '16%' },
  colEvent: { width: '22%' },
  colEventName: { width: '22%' },
  screenshot: {
    marginTop: 6,
    maxWidth: 280,
    maxHeight: 160,
    objectFit: 'contain',
  },
});

function GuidePdfDocument({ document }: { document: GuideDocument }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{document.title}</Text>
        <Text style={styles.subtitle}>Brand: {document.brand}</Text>
        <Text style={styles.subtitle}>Country: {document.country}</Text>
        <Text style={styles.subtitle}>Generated: {document.generatedAt}</Text>

        <Text style={styles.sectionTitle}>Event Index</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colIndex}>#</Text>
          <Text style={styles.colName}>Name</Text>
          <Text style={styles.colType}>Type</Text>
          <Text style={styles.colEvent}>event</Text>
          <Text style={styles.colEventName}>event_name</Text>
        </View>
        {document.index.map((item, index) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.colIndex}>{index + 1}</Text>
            <Text style={styles.colName}>{item.name}</Text>
            <Text style={styles.colType}>{item.structureType}</Text>
            <Text style={styles.colEvent}>{item.event}</Text>
            <Text style={styles.colEventName}>{item.event_name}</Text>
          </View>
        ))}
      </Page>

      {document.events.map((event, index) => (
        <Page key={event.id} size="A4" style={styles.page}>
          <Text style={styles.eventTitle}>
            {index + 1}. {event.name}
          </Text>

          <View style={styles.block}>
            <Text style={styles.label}>General information</Text>
            <Text>Type: {event.structureLabel}</Text>
            <Text>Priority: {event.priorityLabel}</Text>
            <Text>Interaction: {event.interactionType}</Text>
            <Text>Brand: {event.brand}</Text>
            <Text>Country: {event.country}</Text>
            <Text>Description: {event.description || '—'}</Text>
            <Text>Business objective: {event.businessObjective || '—'}</Text>
          </View>

          {event.screenshotDataUrl ? (
            <View style={styles.block}>
              <Text style={styles.label}>Screenshot</Text>
              <Image src={event.screenshotDataUrl} style={styles.screenshot} />
            </View>
          ) : null}

          <View style={styles.block}>
            <Text style={styles.label}>How it triggers</Text>
            <Text>{event.howItTriggers || '—'}</Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.label}>Event data</Text>
            <Text>event: {event.event}</Text>
            <Text>event_name: {event.event_name}</Text>
            <Text>eventCategory: {event.eventCategory}</Text>
            <Text>eventAction: {event.eventAction}</Text>
            <Text>eventLabel: {event.eventLabel}</Text>
            {event.customParams.map((param) => (
              <Text key={param.id}>
                {param.key}: {param.value}
              </Text>
            ))}
          </View>

          <View style={styles.block}>
            <Text style={styles.label}>Implementation script</Text>
            <Text style={styles.code}>{event.script}</Text>
          </View>

          {event.requiredVariables.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.label}>DataLayer dictionary</Text>
              {event.requiredVariables.map((variable) => (
                <Text key={variable.id}>
                  {variable.name} — {variable.description} — eg: {variable.example} —{' '}
                  {variable.required ? 'Required' : 'Optional'}
                </Text>
              ))}
            </View>
          ) : null}
        </Page>
      ))}
    </Document>
  );
}

export async function exportGuideToPdf(documentModel: GuideDocument): Promise<void> {
  const instance = pdf(<GuidePdfDocument document={documentModel} />);
  const blob = await instance.toBlob();
  downloadBlob(blob, `${slugify(documentModel.title)}.pdf`);
}
