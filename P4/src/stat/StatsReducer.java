package oldapi;
import java.io.IOException;
import java.util.Iterator;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapred.MapReduceBase;
import org.apache.hadoop.mapred.OutputCollector;
import org.apache.hadoop.mapred.Reducer;
import org.apache.hadoop.mapred.Reporter;

public class StatsReducer extends MapReduceBase implements Reducer<Text, DoubleWritable, Text, DoubleWritable> {
	public void reduce(Text key, Iterator<DoubleWritable> values, OutputCollector<Text, DoubleWritable> output, Reporter reporter) throws IOException {
		double sum = 0, maxValue = Double.MIN_VALUE, minValue = Double.MAX_VALUE, next;
		int count = 0;
		while (values.hasNext()) {
		  next = values.next().get();
			maxValue = Math.max(maxValue, next);
			minValue = Math.min(minValue, next);
			sum += next;
			count++;
		}
		Double avg = sum / count;
		output.collect(new Text("Max-" + key), new DoubleWritable(maxValue));
		output.collect(new Text("Min-" + key), new DoubleWritable(minValue));
		output.collect(new Text("Avg-" + key), new DoubleWritable(avg));
	}
}