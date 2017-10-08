package oldapi;
import java.io.IOException;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapred.MapReduceBase;
import org.apache.hadoop.mapred.Mapper;
import org.apache.hadoop.mapred.OutputCollector;
import org.apache.hadoop.mapred.Reporter;
import org.apache.hadoop.mapred.JobConf;

public class CorrMapper extends MapReduceBase implements Mapper<LongWritable, Text, Text, Text> {
        private static final int MISSING = 9999;
        private static int col;
        public void configure(JobConf job) {
                col = Integer.parseInt(job.get("col"));
        }
        public void map(LongWritable key, Text value, OutputCollector<Text, Text> output, Reporter reporter) throws IOException {
                String line = value.toString();
                String[] parts = line.split(",");
                int length = parts.length - 1;
                if(col==-1)
                    for (int i = 0; i < length; i++)
                        for (int j = i + 1; j < length; j++)
                            output.collect(new Text(Integer.toString(i) + ", " + Integer.toString(j)), new Text(parts[i] + ", " + parts[j]));
        }
}
